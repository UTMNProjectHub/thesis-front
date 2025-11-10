import { ApiClient } from "@/lib/api-client";

class QuizApi extends ApiClient {
  constructor() {
    super();
  }

  async deleteQuiz(id: string) {
    return await this.client.delete(`/quizes/${id}`);
  }
}

const quizApi = new QuizApi();

export default quizApi;