import {
  ProposalResponse,
  ProposalListResponse,
  ProposalCreatePayload,
} from "../types/proposal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async createProposal(payload: ProposalCreatePayload): Promise<ProposalResponse> {
    const response = await fetch(`${this.baseUrl}/proposals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error?.message || errorData.detail || errorMsg;
      } catch (e) {
        // ignore JSON parse error
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  async listProposals(search?: string): Promise<ProposalListResponse> {
    const url = new URL(`${this.baseUrl}/proposals`);
    if (search && search.trim()) {
      url.searchParams.append("search", search.trim());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.status}`);
    }

    return response.json();
  }

  async getProposal(id: string): Promise<ProposalResponse> {
    const response = await fetch(`${this.baseUrl}/proposals/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch proposal: ${response.status}`);
    }

    return response.json();
  }

  async deleteProposal(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/proposals/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete proposal: ${response.status}`);
    }
  }
}

export const apiService = new ApiService();
