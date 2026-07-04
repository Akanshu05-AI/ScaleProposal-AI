from abc import ABC, abstractmethod

from app.services.gemini_service import GeminiService


class BaseAgent(ABC):

    @property
    @abstractmethod
    def agent_name(self):
        pass

    @abstractmethod
    def build_prompt(self, **kwargs):
        pass

    def generate(self, **kwargs):

        prompt = self.build_prompt(**kwargs)

        return GeminiService.generate(prompt)