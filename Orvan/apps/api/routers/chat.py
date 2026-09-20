


# from fastapi import APIRouter
# from qdrant_client.http import model


# router = APIRouter()

# @router.post("/ingest")
# async def chat(ticker:str , prompt: str ):
#     print("The question is" + question)
#     qvector = model.encode(question).tolist()
#     sql_query = """
#     WITH vector_search AS (
#         SELECT id, content, 
#                RANK() OVER (ORDER BY embedding <=> CAST(:vector AS vector)) AS vector_rank
#         FROM "Document_chunks"
#         ORDER BY embedding <=> CAST(:vector AS vector)
#         LIMIT 20
#     ),
#     keyword_search AS (
#         SELECT id, content,
#                RANK() OVER (ORDER BY ts_rank_cd(fts_vector, plainto_tsquery('english', :query)) DESC) AS keyword_rank
#         FROM "Document_chunks"
#         WHERE fts_vector @@ plainto_tsquery('english', :query)
#         ORDER BY keyword_rank
#         LIMIT 20
#     )
#     SELECT 
#         COALESCE(v.id, k.id) AS chunk_id,
#         COALESCE(v.content, k.content) AS content,
#         (COALESCE(1.0 / (60 + v.vector_rank), 0.0)) + 
#         (COALESCE(1.0 / (60 + k.keyword_rank), 0.0)) AS rrf_score
#     FROM vector_search v
#     FULL OUTER JOIN keyword_search k ON v.id = k.id
#     ORDER BY rrf_score DESC
#     LIMIT 5; -- Return the absolute best 5 chunks
#     """

#     db = SessionLocal()
#     try:
#         results = db.execute(
#             text(sql_query),
#             {"vector": str(qvector) , "query" : question}
#         ).fetchall()
#         print(results)
#         return results
#     finally:
#         db.close()
#     return
