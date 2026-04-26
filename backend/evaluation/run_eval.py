import os
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import Faithfulness
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()


def run_evaluation():
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set.")

    eval_llm = ChatGroq(
        temperature=0, 
        model_name="llama-3.3-70b-versatile", 
        api_key=groq_api_key
    )

    eval_embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
    )

    data_samples = {
        "question": ["What does the Quantum Battery paper say about overheating?"],
        "answer": ["The Quantum Battery charges instantly and has zero risk of overheating."],
        "contexts": [
            ["Quantum batteries charge instantly and have absolutely zero risk of overheating during the process."]
        ],
    }

    dataset = Dataset.from_dict(data_samples)

    print("🚀 Starting Ragas Evaluation pipeline...")

    result = evaluate(
        dataset=dataset,
        metrics=[Faithfulness()],
        llm=eval_llm,
        embeddings=eval_embeddings,
        raise_exceptions=False
    )

    print("\n📊 Evaluation Results:")
    print(result)

if __name__ == "__main__":
    run_evaluation()