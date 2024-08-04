import { api } from "./api"
import {TripDetails} from "@/server/trip-server";
import {AxiosError} from "axios";

export type Link = {
    id: string
    title: string
    url: string
}

type LinkCreate = Omit<Link, "id"> & {
    tripId: string
}

type LinkUpdate = Link & {
    tripId: string;
}

type LinkDelete = Omit<LinkUpdate, "url" | "title">

async function create({tripId, title, url} : LinkCreate) {
    try {
        await api.post(`/TripLinks/${tripId}/register`, {
            title,
            url,
        });
    } catch (error) {
        console.log("Erro ao salvar os links da viagem.", error);
        console.log({title, url});
        throw error;
    }
}
async function update({tripId, id, title, url} : LinkUpdate) {
    try {
        await api.put(`/TripLinks/${tripId}/update/${id}`, {
            title,
            url,
        });
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            console.log( error.response.data.errors);
        }
        console.log("Erro ao atualizar o link da viagem.", error);
        console.log({title, url}, "link id:", {id}, "trip id:", {tripId} );
        throw error;
    }
}

async function deleteLink({tripId, id}: LinkDelete) {
    try {
        await api.delete(`/TripLinks/${tripId}/delete/${id}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            console.log( error.response.data.errors);
        }
        console.log("Erro ao deletar o link da viagem.", error);
        console.log("link id:", {id}, "trip id:", {tripId} );
        throw error;
    }
}

async function getByTripId(tripId: string) {
    try {
        const {data} = await api.get<TripDetails>(`/Trip/${tripId}`);
        return data.links
    } catch (error) {
        console.log("Erro ao buscar os links da viagem.", error);
        throw error
    }
}

export const linksServer = { getByTripId, create,update, deleteLink}