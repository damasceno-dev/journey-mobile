import {api} from "@/server/api";
import {Activity} from "@/server/activities-server";
import {Participant, participantsServer} from "@/server/participants-server";
import {Link} from "@/server/link-server";


export type TripDetails = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    activities?: Activity[];
    participants?: Participant[];
    links?: Link[];
}

export type TripCreate = Omit<TripDetails, "id" >

async function getById(id: string): Promise<TripDetails> {
    
    try {
      const {data} = await api.get<TripDetails>(`/Trip/${id}`);
        return data;
    } catch (error) {
        console.log(error)
      throw error;
    }
}

async function create({name,startDate, endDate, participants} : TripCreate) : Promise<TripDetails> {
    try {
      const {data} = await api.post("/Trip/register", {
          name,
          startDate,
          endDate
      });
      
        if (participants && participants.length > 0) {
            for (const participant of participants) {
                const participantCreate = {tripId: data.id, name: participant.name, email: participant.email}
                await participantsServer.create(participantCreate)
            }
        }
  return {
          id: data.id,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
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