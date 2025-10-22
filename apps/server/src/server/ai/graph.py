from typing import Any

from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage
from langchain_ollama import OllamaEmbeddings
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.constants import END, START
from langgraph.graph import StateGraph
from pinecone import Pinecone
from psycopg import AsyncConnection

from server.ai.config import settings
from server.ai.state import State


async def build_graph(connection: AsyncConnection[Any]):
    await connection.set_autocommit(True)
    checkpointer = AsyncPostgresSaver(connection)
    await checkpointer.setup()
    graph_builder = StateGraph(state_schema=State)
    graph_builder.add_node("chatbot", chatbot_node)
    graph_builder.add_edge(START, "chatbot")
    graph_builder.add_edge("chatbot", END)
    return graph_builder.compile(checkpointer=checkpointer)


def get_model():
    return init_chat_model(
        model="gpt-5",
        model_provider="openai",
        temperature=0.4,
    )


def get_retriever():
    embed = OllamaEmbeddings(model="llama2", base_url=settings.OLLAMA_HOST)
    pc = Pinecone(api_key=settings.PINECONE_API_KEY, host=settings.PINECONE_ENDPOINT)
    idx = pc.Index(settings.PINECONE_INDEX)
    return idx, embed


async def chatbot_node(state: State):
    model = get_model()
    idx, embed = get_retriever()
    relevant = idx.search_records(
        query_vector=embed.embed_query(state.question),
        top_k=5,
    )
    print(relevant)
    system_message = SystemMessage(
        f"""
    You are a helpful assistant answering questions about the FAQ 
    of a fintech company regarding questions users might have about creating and verifying an account,
    managing payments and transfers, keeping their accounts secure and understanding financial regulations
    
    The following is a list of relevant information that may help you answer the user's question:
    {relevant}
    """
    )
    response = await model.ainvoke([system_message] + state.messages)
    return {"messages": response}
