import axios from "axios";
import type {
  ProposalRequest,
  ProposalResponse,
} from "@/types/proposal";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

export async function generateProposal(
  data: ProposalRequest
): Promise<ProposalResponse> {
  const response = await api.post<ProposalResponse>(
    "/proposal",
    data
  );

  return response.data;
}

export default api;