import { Injectable, inject } from "@angular/core";
import { Functions, httpsCallable } from "@angular/fire/functions";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasResultField<T>(value: unknown): value is { result: T } {
  return isRecord(value) && "result" in value;
}

@Injectable({ providedIn: "root" })
export class AgentService {
  private fns = inject(Functions);
  private auth = inject(AuthService);

  private call = httpsCallable<AgentRequest, AgentResponse<unknown>>(
    this.fns,
    "CallAgent",
  );

  private dispatch<T>(intent: AgentIntent, payload: Record<string, unknown>) {
    const sessionId = this.auth.currentUser?.uid ?? "anon";
    return this.call({ intent, payload, sessionId }).then((r) => {
      const responseData: unknown = r.data;
      if (hasResultField<T>(responseData)) {
        return responseData.result;
      }
      return responseData as T;
    });
  }

  matchVolunteers(task: Task, volunteers: Volunteer[]) {
    return this.dispatch<VolunteerMatch[]>("MATCH_VOLUNTEERS", {
      task,
      volunteers,
    });
  }

  predictSurge(region: string) {
    return this.dispatch<SurgePrediction[]>("PREDICT_SURGE", { region });
  }

  narrateReport(stats: WeeklyStats) {
    return this.dispatch<string>("NARRATE_REPORT", { stats });
  }

  queryAssistant(question: string, context: Record<string, unknown>) {
    return this.dispatch<string>("QUERY_ASSISTANT", { question, context });
  }
}
