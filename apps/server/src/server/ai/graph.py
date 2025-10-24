from typing import Any

from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.constants import END, START
from langgraph.graph import StateGraph
from psycopg import AsyncConnection

from server.ai.config import settings
from server.ai.state import State
from server.ai.vector_store.store import get_retriever


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
        model="llama2",
        model_provider="ollama",
        temperature=0.4,
        tags=["assistant"],
        base_url=settings.OLLAMA_HOST,
    )


async def chatbot_node(state: State):
    model = get_model()
    # Retrieve relevant FAQ chunks for the latest user message if present
    user_msg = None
    retriever = get_retriever()
    for m in reversed(state.messages or []):
        if isinstance(m, HumanMessage):
            user_msg = m.content
            break
    retrieved_context = ""
    if user_msg:
        docs = retriever.invoke(user_msg)
        retrieved_context = "\n\n".join(f"- {d.page_content}" for d in docs)
    system_message = SystemMessage(
        f"""
    You are a helpful assistant answering questions about the FAQ 
    of a fintech company regarding questions users might have about creating and verifying an account,
    managing payments and transfers, keeping their accounts secure and understanding financial regulations
    Retrieved context:
    {retrieved_context}
    """
    )
    response = await model.ainvoke([system_message] + state.messages)
    return {"messages": response}
