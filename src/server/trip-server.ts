import {api} from "@/server/api";

export type Activity = {
    id: string;
    name: string;
    date: string;
    status: boolean
}

export type Participant = {
    id?: string;
    name: string;
    email: string;
    isConfirmed?: boolean;
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

async function getById(id: string): Promise<TripDetails> {
    try {
      const {data} = await api.get<TripDetails>(`/Trip/${id}`);
        return data;
    } catch (error) {
      throw error;
    }
}

async function create({name,startDate, endDate, activities, participants} : TripCreate) : Promise<TripDetails> {
    try {
      const {data} = await api.post("/Trip/register", {
          name,
          startDate,
          endDate
      });
      
      if (activities && activities.length > 0) {
        for (const activity of activities) {
            try {
                await api.post(`/TripActivities/${data.id}/register`, {
                    name: activity.name,
                    date: activity.date,
                })
            } catch (error) {
                console.log("Erro ao salvar as atividades da viagem.", error);
                console.log(activity);
            }
            
        }
      }
      
      if (participants && participants.length > 0) {
        for (const participant of participants) {
            try {
                await api.post(`/TripParticipants/${data.id}/register`, {
                    name: participant.name,
                    email: participant.email,
                });
            } catch (error) {
                console.log("Erro ao salvar os participantes da viagem.", error);
                console.log(participant);
            }
        }
      }
      
  return {
          id: data.id,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          activities: activities,
          participants: participants,
      };
      
    } catch (error) {
      console.log(error);
      throw error;
    }
}

async function update({id, name, startDate, endDate}:Omit<TripDetails, "activities" | "participants">) {
    try {
      await api.put(`/Trip/${id}/update`, {
          name, startDate, endDate
      });
    } catch (error) {
        console.log(error)
      throw error;
    }
}

export const tripServer = {getById, create, update}