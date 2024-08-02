import {api} from "@/server/api";
import {Activity} from "@/server/activities-server";
import {TripDetails} from "@/server/trip-server";


export type Participant = {
    id?: string;
    name: string;
    email: string;
    isConfirmed?: boolean;
}

type ParticipantCreate = Omit<Participant, "id"> & {
    tripId: string
}

type ParticipantConfirm = Participant & {
    tripId: string
}

async function create({tripId, name, email} : ParticipantCreate) {
    try {
        await api.post(`/TripParticipants/${tripId}/register`, {
            name,
            email,
        });
    } catch (error) {
        console.log("Erro ao salvar os participantes da viagem.", error);
        console.log({name, email});
    }
}

async function getByTripId(tripId: string) : Promise<Promise<Participant[]> | undefined>{
    try {
        const {data} = await api.get<TripDetails>(`/Trip/${tripId}`);
        return data.participants
    } catch (error) {
        console.log("Erro ao buscar as atividades da viagem.", error);
        throw error
    }
}

async function confirmTripByParticipantId({tripId,id}: ParticipantConfirm) {
    try {
        await api.put(`/TripParticipants/${tripId}/confirm/${id}`)
    } catch (error) {
        console.log("Erro ao confirmar participante na viagem.", error);
        throw error
    }
}

export const participantsServer = { create, getByTripId, confirmTripByParticipantId }