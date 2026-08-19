import axios from "axios";
import type {
  ProposalCreatePayload,
  ProposalResponse,
} from "@/types/proposal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

export async function generateProposal(
  data: ProposalCreatePayload
): Promise<ProposalResponse> {
  const response = await api.post<ProposalResponse>(
    "/proposals",
    data
  );

  return response.data;
}

export default api;