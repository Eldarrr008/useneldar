CREATE OR REPLACE FUNCTION public.prepare_survey_safety() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a jsonb; q text; v integer; seen text[]:='{}'; ph integer:=0; ga integer:=0; ps integer:=0; mb integer:=0; c integer[]:=ARRAY[0,0,0,0,0,0]; pq9 integer:=0; risks text[]; high_n integer; med_n integer;
BEGIN
 IF NEW.survey_id NOT IN ('quick','comprehensive') OR NEW.survey_type<>NEW.survey_id OR jsonb_typeof(NEW.answers)<>'array' THEN RAISE EXCEPTION 'Invalid survey'; END IF;
 IF jsonb_array_length(NEW.answers)<>(CASE WHEN NEW.survey_id='quick' THEN 22 ELSE 47 END) THEN RAISE EXCEPTION 'Incomplete survey'; END IF;
 FOR a IN SELECT * FROM jsonb_array_elements(NEW.answers) LOOP
 q:=a->>'questionId';
 IF q IS NULL OR q=ANY(seen) OR jsonb_typeof(a->'value')<>'number' OR (a->>'value') !~ '^[0-9]+$' THEN RAISE EXCEPTION 'Invalid answer'; END IF;
 v:=(a->>'value')::integer; seen:=array_append(seen,q);
 IF q ~ '^phq9_[1-9]$' AND v BETWEEN 0 AND 3 THEN ph:=ph+v; IF q='phq9_9' THEN pq9:=v; END IF;
 ELSIF q ~ '^gad7_[1-7]$' AND v BETWEEN 0 AND 3 THEN ga:=ga+v;
 ELSIF NEW.survey_id='comprehensive' AND q ~ '^pss_([1-9]|10)$' AND v BETWEEN 0 AND 4 THEN ps:=ps+v;
 ELSIF NEW.survey_id='comprehensive' AND q ~ '^mbi_(ex[1-5]|cy[1-4]|ef[1-6])$' AND v BETWEEN 0 AND 6 THEN mb:=mb+v;
 ELSIF q ~ '^cssrs_[1-5]$' AND v IN (0,substring(q from '[1-5]$')::integer) THEN c[substring(q from '[1-5]$')::integer]:=v;
 ELSIF q='cssrs_6' AND v IN (0,3,6) THEN c[6]:=v;
 ELSE RAISE EXCEPTION 'Invalid answer range'; END IF;
 END LOOP;
 NEW.phq9_score:=ph; NEW.gad7_score:=ga; NEW.pss_score:=NULLIF(ps,0); NEW.burnout_score:=NULLIF(mb,0);
 IF c[5]>0 OR c[6]>=6 OR c[4]>0 OR (c[6]>0 AND (c[1]>0 OR c[2]>0 OR c[3]>0)) THEN NEW.overall_risk:='CRITICAL';
 ELSIF c[3]>0 OR c[2]>0 THEN NEW.overall_risk:='HIGH';
 ELSIF pq9>=2 THEN NEW.overall_risk:='CRITICAL';
 ELSIF pq9=1 THEN NEW.overall_risk:='HIGH';
 ELSIF ph>=20 OR mb>=68 THEN NEW.overall_risk:='CRITICAL';
 ELSE
 risks:=ARRAY[CASE WHEN ph>=15 THEN 'HIGH' WHEN ph>=10 THEN 'MEDIUM' ELSE 'LOW' END,CASE WHEN ga>=15 THEN 'HIGH' WHEN ga>=10 THEN 'MEDIUM' ELSE 'LOW' END,CASE WHEN ps>=27 THEN 'HIGH' WHEN ps>=14 THEN 'MEDIUM' ELSE 'LOW' END,CASE WHEN mb>=46 THEN 'HIGH' WHEN mb>=23 THEN 'MEDIUM' ELSE 'LOW' END];
 SELECT count(*) FILTER(WHERE x='HIGH'),count(*) FILTER(WHERE x='MEDIUM') INTO high_n,med_n FROM unnest(risks) x;
 NEW.overall_risk:=CASE WHEN high_n>=3 THEN 'CRITICAL' WHEN high_n>=2 OR ph>=15 OR ga>=15 THEN 'HIGH' WHEN med_n>=2 OR high_n>=1 THEN 'MEDIUM' ELSE 'LOW' END;
 END IF;
 NEW.ai_analysis:=NULL; NEW.completed_at:=now(); NEW.created_at:=now(); RETURN NEW;
END $$;
COMMENT ON FUNCTION public.prepare_survey_safety() IS 'Server compatibility snapshot of existing scoring, pending professional methodology review; existing responses are not recalculated.';
REVOKE ALL ON FUNCTION public.prepare_survey_safety() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER prepare_survey_safety BEFORE INSERT ON public.survey_responses FOR EACH ROW EXECUTE FUNCTION public.prepare_survey_safety();
CREATE OR REPLACE FUNCTION public.notify_survey_safety() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text,0));
 UPDATE public.student_data SET risk_level=NEW.overall_risk,last_survey_date=NEW.completed_at WHERE user_id=NEW.user_id AND (last_survey_date IS NULL OR last_survey_date<=NEW.completed_at);
 IF NEW.overall_risk IN ('HIGH','CRITICAL') THEN
 INSERT INTO public.alerts(student_id,type,message,survey_response_id) VALUES(NEW.user_id,CASE WHEN NEW.overall_risk='CRITICAL' THEN 'survey_critical' ELSE 'survey_high' END,'Опрос: требуется рассмотрение психологом. Сигнал не является диагнозом.',NEW.id) ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_survey_safety() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER notify_survey_safety AFTER INSERT ON public.survey_responses FOR EACH ROW EXECUTE FUNCTION public.notify_survey_safety();
CREATE OR REPLACE FUNCTION public.notify_chat_safety() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pupil uuid;
BEGIN
 SELECT student_id INTO pupil FROM public.conversations WHERE id=NEW.conversation_id;
 IF NOT EXISTS(SELECT 1 FROM public.messages WHERE id=NEW.message_id AND conversation_id=NEW.conversation_id AND NOT is_ai AND sender_id=pupil) THEN RAISE EXCEPTION 'Invalid crisis source'; END IF;
 INSERT INTO public.alerts(student_id,type,message,message_id) VALUES(pupil,'crisis','Чат: обнаружен сигнал, требующий рассмотрения психологом.',NEW.message_id) ON CONFLICT DO NOTHING;
 UPDATE public.conversations SET has_crisis=true WHERE id=NEW.conversation_id; RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_chat_safety() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER notify_chat_safety AFTER INSERT ON public.crisis_detections FOR EACH ROW EXECUTE FUNCTION public.notify_chat_safety();
CREATE OR REPLACE FUNCTION public.persist_chat_safety(p_student uuid,p_conversation uuid,p_request uuid,p_content text,p_keywords text[],p_severity text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE conv uuid; msg uuid; existing public.messages; notified boolean;
BEGIN
 IF p_request IS NULL OR p_content IS NULL OR p_severity IS NULL OR length(trim(p_content))=0 OR length(p_content)>10000 OR p_severity NOT IN ('none','high','critical') OR NOT public.has_role(p_student,'student') THEN RAISE EXCEPTION 'Invalid chat request'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_student::text||p_request::text,0));
 SELECT * INTO existing FROM public.messages WHERE sender_id=p_student AND request_id=p_request;
 IF FOUND THEN
 IF existing.content<>p_content OR (p_conversation IS NOT NULL AND existing.conversation_id<>p_conversation) THEN RAISE EXCEPTION 'Request already used'; END IF;
 conv:=existing.conversation_id; msg:=existing.id;
 ELSE
 IF p_conversation IS NOT NULL THEN
 SELECT id INTO conv FROM public.conversations WHERE id=p_conversation AND student_id=p_student;
 IF conv IS NULL THEN RAISE EXCEPTION 'Conversation unavailable'; END IF;
 ELSE INSERT INTO public.conversations(student_id,title) VALUES(p_student,left(p_content,50)) RETURNING id INTO conv; END IF;
 INSERT INTO public.messages(conversation_id,sender_id,content,request_id) VALUES(conv,p_student,p_content,p_request) RETURNING id INTO msg;
 END IF;
 IF p_severity<>'none' THEN
 INSERT INTO public.crisis_detections(conversation_id,message_id,severity,keywords,context) VALUES(conv,msg,p_severity,p_keywords,p_content) ON CONFLICT(message_id) DO NOTHING;
 END IF;
 SELECT EXISTS(SELECT 1 FROM public.alerts WHERE message_id=msg) AND EXISTS(SELECT 1 FROM public.student_data sd JOIN public.classrooms c ON c.id=sd.classroom_id JOIN public.classroom_members cm ON cm.classroom_id=c.id AND cm.student_id=sd.user_id WHERE sd.user_id=p_student AND c.is_active AND public.has_role(c.psychologist_id,'psychologist')) INTO notified;
 RETURN jsonb_build_object('conversationId',conv,'messageId',msg,'specialistNotified',notified);
END $$;
REVOKE ALL ON FUNCTION public.persist_chat_safety(uuid,uuid,uuid,text,text[],text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.persist_chat_safety(uuid,uuid,uuid,text,text[],text) TO service_role;