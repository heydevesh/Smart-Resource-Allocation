import { Injectable, inject } from "@angular/core";
import { HttpCallService } from "../firebase/http-call.service";
import { AuthService } from "../auth/auth.service";
import {
  Task,
  Volunteer,
  VolunteerMatch,
  WeeklyStats,
  SurgePrediction,
} from "../../models";

export type AgentIntent =
  | "MATCH_VOLUNTEERS"
  | "PREDICT_SURGE"
  | "NARRATE_REPORT"
  | "QUERY_ASSISTANT";

interface AgentRequest {
  intent: AgentIntent;
  payload: Record<string, unknown>;
  sessionId: string;
}

interface AgentResponse<T> {
  result: T;
  agentUsed: string;
}

function hasResultField<T>(value: unknown): value is { result: T } {
  return typeof value === "object" && value !== null && "result" in value;
}

@Injectable({ providedIn: "root" })
export class AgentService {
  private http = inject(HttpCallService);
  private auth = inject(AuthService);

  private async dispatch<T>(intent: AgentIntent, payload: Record<string, unknown>): Promise<T> {
    const sessionId = this.auth.currentUser?.uid ?? "anon";
    const responseData = await this.http.call<AgentRequest, AgentResponse<unknown>>(
      "CallAgent",
      { intent, payload, sessionId }
    );

    if (hasResultField<T>(responseData)) {
      return responseData.result;
    }
    return responseData as T;
  }

  matchVolunteers(task: Task, volunteers: Volunteer[]) {
    return this.dispatch<VolunteerMatch[]>("MATCH_VOLUNTEERS", { task, volunteers });
  }

  predictSurge(region: string) {
    return this.dispatch<SurgePrediction[]>("PREDICT_SURGE", { region });
  }

  narrateReport(stats: WeeklyStats) {
    return this.dispatch<string>("NARRATE_REPORT", { stats });
  }

  queryAssistant(question: string, context: Record<string, unknown>) {
    return this.dispatch<{ answer: string }>("QUERY_ASSISTANT", { question, context });
  }
}
