import {api} from "@/server/api";
import {TripDetails} from "@/server/trip-server";
import {AxiosError} from "axios";

export type Activity = {
    id: string
    date: string
    name: string
    status?: boolean
}

type ActivityCreate = Omit<Activity, "id"> & {
    tripId: string
}

async function create({tripId, date, name} : ActivityCreate) {
    try {
        await api.post(`/TripActivities/${tripId}/register`, {
            name,
            date,
        })
    } catch (error) {
        console.log("Erro ao salvar as atividades da viagem.", error);
        console.log({tripId, date, name});
        if (error instanceof AxiosError && error.response) {
            console.log( error.response.data.errors);
        }
        throw error
    }
}

async function getByTripId(tripId: string) : Promise<Promise<Activity[]> | undefined>{
    try {
        const {data} = await api.get<TripDetails>(`/Trip/${tripId}`);
        return data.activities
    } catch (error) {
        console.log("Erro ao buscar as atividades da viagem.", error);
        throw error
    }
}

async function update(tripId: string, activityId: string) {
    try {
      await api.put(`/TripActivities/${tripId}/complete/${activityId}`);
    } catch (error) {
      throw error;
    }
}

export const activitiesServer = { create, getByTripId, update
}