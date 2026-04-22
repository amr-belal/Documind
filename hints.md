سؤال ممتاز جداً! وقفتك هنا عشان تسأل "هل ده أسرع حاجة ولا في أحسن؟" هو ده بالضبط تفكير الـ **Senior/Staff Engineer** اللي الشركات الكبيرة بتدور عليه. إنت كده مش بتكتب كود وخلاص، إنت بتفكر في الـ **System Design والـ Bottlenecks**.

الإجابة المباشرة: **الطريقة اللي إحنا ماشيين بيها (FastAPI يستقبل الفايل ويرفعه لـ MinIO) طريقة Standard وممتازة جداً كبداية، بس مش أسرع ولا أحسن حاجة لو عندنا Scale كبير.**

تعالى أشرحلك ليه، وإيه هو الحل السحري بتاع الـ FAANG.

### 🐢 الطريقة الحالية: الـ API كوسيط (Middleman)
اللي بنعمله دلوقتي كالتالي:
1. اليوزر بيبعت فايل 50 ميجا للـ FastAPI.
2. الـ FastAPI بيستقبل الفايل ويحمله في الـ Memory/Disk بتاع السيرفر.
3. الـ FastAPI يفتح اتصال مع MinIO ويبعتله الـ 50 ميجا.

**المشكلة:** لو عندنا 100 يوزر بيرفعوا فايلات في نفس الوقت، سيرفر الـ FastAPI هيستهلك RAM و Bandwidth مهول! السيرفر هيعرق ومش هيقدر يرد على أي Requests تانية (زي الـ Search مثلاً) لأنه مشغول بنقل الفايلات.

---

### 🚀 الحل الأسرع والأحسن: الـ Presigned URLs (Direct-to-Cloud Upload)
في الشركات الكبيرة (زي Netflix, YouTube, Google Drive)، الـ Backend سيرفر **عمره ما بيلم الفايل نفسه**. 

الـ Pattern السليم بيمشي كده:
1. **طلب التصريح:** اليوزر بيقول للـ FastAPI: "أنا عايز أرفع فايل اسمه `paper.pdf` حجمه 10 ميجا".
2. **إصدار التذكرة:** الـ FastAPI بيتأكد إن اليوزر ده مسموحله يرفع (Validation)، وبعدين يكلم MinIO يقوله: "اعملي لينك رفع مؤقت (Presigned URL) صالح لمدة 5 دقايق للفايل ده".
3. **الرد:** الـ FastAPI بيرجع اللينك ده لليوزر.
4. **الرفع المباشر (السحر هنا):** اليوزر بياخد اللينك، ويرفع الفايل **مباشرةً** من المتصفح (أو الموبايل) لـ MinIO. الـ FastAPI ملوش أي دعوة ومبيستهلكش أي Resources!
5. **التأكيد:** أول ما الـ MinIO يستلم الفايل بنجاح، بيبعت Event لـ Kafka، والـ Celery Workers تبدأ شغل.

### ⚖️ المقارنة (Trade-offs):

| وجه المقارنة | طريقتنا الحالية (Middleman) | طريقة الـ Presigned URLs (Direct) |
| :--- | :--- | :--- |
| **السرعة والـ Scale** | بطيئة، بتعمل Load عالي على السيرفر | سريعة جداً، السيرفر فاضي تماماً |
| **صعوبة الكود** | سهلة جداً (زي ما إحنا بنعمل دلوقتي) | معقدة شوية (محتاجة كود مختلف في الـ Frontend والـ Backend) |
| **الاستخدام** | للفايلات الصغيرة (صور، PDFs خفيفة) | للفايلات الكبيرة جداً (فيديوهات، Data sets) |

---

### 🎯 قرارك إيه كـ Architect؟
بما إننا في مرحلة بناء الـ **MVP (Minimum Viable Product)**، نصيحتي كـ Mentor ليك هي:
**خلينا نكمل بالطريقة الحالية الأول.** ليه؟ 
عشان نخلص الـ Pipeline كامل (من أول الـ Upload لحد الـ Knowledge Graph)، وتشوف السيستم شغال من الأول للآخر. 
أول ما السيستم يشتغل، هنمسك الـ Endpoint ده نعمله **Refactoring** لـ Presigned URL. وهنكتب ده في الـ Portfolio بتاعك: 
*"Migrated from synchronous server-side uploads to Direct-to-Storage Presigned URLs, reducing API server load by 90%."* (ودي جملة بتخطف عين أي Recruiter).

إيه رأيك؟ نكمل في طريقنا ونخلص الـ Client بتاع MinIO جوه الـ FastAPI، ولا حابب نقلب الـ Architecture للـ Presigned URLs من دلوقتي؟ القرار ليك.



kafka submission tasks: 
```

INFO:kafka.conn:<BrokerConnection node_id=1 host=localhost:9092 <connecting> [IPv4 ('127.0.0.1', 9092)]>: connecting to localhost:9092 [('127.0.0.1', 9092) IPv4]
INFO:kafka.conn:<BrokerConnection node_id=1 host=localhost:9092 <connecting> [IPv4 ('127.0.0.1', 9092)]>: Connection complete.
INFO:kafka.conn:<BrokerConnection node_id=bootstrap-0 host=localhost:9092 <connected> [IPv4 ('127.0.0.1', 9092)]>: Closing connection. 
INFO:app.infrastructure.messaging.kafka_producer:Message sent to topic raw_documents: {'file_id': 'eb85b3e0-591d-48e9-908b-89a8005255d1', 'file_path': 'minio://papers/c6660252-4932-4189-8139-7a8ffb345601.pdf', 'file_name': "Hybrid Search Revamped - Building with Qdrant's Query API.pdf"}
INFO:     127.0.0.1:51621 - "POST /upload HTTP/1.1" 200 OK

```

{
    "message": "File uploaded successfully",
    "file_details": {
        "id": "88fcb5a8-e609-4372-8526-7b18765a6e1d",
        "file_name": "Hybrid Search Revamped - Building with Qdrant's Query API.pdf",
        "status": "pending",
        "file_path": "minio://papers/4e1a36d7-4384-4bd8-99c4-d52486655fd7.pdf",
        "created_at": "2026-04-19T23:33:08.146353+00:00"
    }
}




### instead of SpaCy

1. spaCy أول (سريع + مجاني)
   ↓
2. Filter الـ USEFUL_LABELS
   ↓
3. Ollama للـ re-labeling بس
   (مش extraction من الصفر)
   يبعت: entity text + spaCy label
   يرجع: corrected label



    NER with ollama increased time from 4 sec to 100 sec so
    > solution 
    Batch processing  & Async
    100 to 54

