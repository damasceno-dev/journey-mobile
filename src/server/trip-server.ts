import {api} from "@/server/api";
import Id from "ajv/lib/vocabularies/core/id";
import {awaitExpression} from "@babel/types";

export type Activity = {
    id: string;
    name: string;
    date: string;
    status: boolean
}

export type Participant = {
    id: string;
    name: string;
    email: string;
    isConfirmed: boolean;
}

export type TripDetails = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    activities?: Activity[];
    participants?: Participant[];
}

export type TripCreate = Omit<TripDetails, "id" >

async function getById(id: string) {
    try {
      const {data} = await api.get<{trip: TripDetails}>(`/Trip/${id}`);
      return data.trip;
    } catch (error) {
      throw error;
    }
}

async function create({name,startDate, endDate, activities, participants} : TripCreate) {
    try {
      const {data} = await api.post("/Trip/register", {
          name,
          startDate,
          endDate
      });
      
      if (activities && activities.length > 0) {
        for (const activity of activities) {
            await api.post(`/TripActivities/${data.id}/register`, {
                name: activity.name,
                date: activity.date,
            })
        }
      }
      
      if (participants && participants.length > 0) {
        for (const participant of participants) {
            await api.post(`/TripParticipants/${data.id}/register`, {
                name: participant.name,
                email: participant.email,
            })
        }
      }
      
      return data.id;
      
    } catch (error) {
      throw error;
    }
}

export const tripServer = {getById, create}