import { ApiClient } from "@/lib/api-client";

class SummaryApi extends ApiClient {
  constructor() {
    super();
  }

  async deleteSummary(id: string) {
    return await this.client.delete(`/summaries/${id}`);
  }
}

const summaryApi = new SummaryApi();

export default summaryApi;
