from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import Chroma  # Chroma 사용
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

class CafeKioskChatbot:
    def __init__(self):
        self.setup_langchain()

    def setup_langchain(self):
        try:
            # PDF 로드
            file_path = "../data/최최최종메뉴판.pdf"
            loader = PyPDFLoader(file_path)
            docs = loader.load()

            # 텍스트 분할
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            splits = text_splitter.split_documents(docs)

            # 벡터 저장소 설정 (Chroma 사용)
            self.vectorstore = Chroma.from_documents(
                documents=splits, 
                embedding=OpenAIEmbeddings()
            )
            self.retriever = self.vectorstore.as_retriever()

            # LLM 설정
            llm = ChatOpenAI(model="gpt-3.5-turbo")

            # 프롬프트 템플릿 설정
            system_prompt = """
            너는 카페 메뉴에 대한 키오스크 역할을 하는 어시스턴트야.
            다음에 제공된 문서만을 사용하여 질문에 답해.
            답을 모를 경우 모른다고 말해.
            최대 세 문장으로 답변을 간결하게 말해줘.
            음료를 추천할 때 어울리는 디저트도 함께 추천해.

            {context}
            """

            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", "{input}"),
            ])

            # RAG 체인 생성
            self.question_answer_chain = create_stuff_documents_chain(llm, prompt)
            self.rag_chain = create_retrieval_chain(self.retriever, self.question_answer_chain)
            
        except Exception as e:
            print(f"Error in setup_langchain: {e}")
            raise

    async def get_response(self, message: str) -> str:
        try:
            results = self.rag_chain.invoke({"input": message})
            return results['answer']
        except Exception as e:
            print(f"Error in get_response: {e}")
            return "죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다."

    async def get_menu_price(self, menu_name: str) -> float:
        try:
            price_prompt = f"'{menu_name}'의 가격을 숫자만 반환해줘."
            results = self.rag_chain.invoke({"input": price_prompt})
            return float(results['answer'].strip())
        except Exception as e:
            print(f"Error in get_menu_price: {e}")
            return None