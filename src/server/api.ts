import axios from "axios";

export const api = axios.create({
    baseURL: "http://a79a3a5ab80104eeea9b24701dfde733-1103991647.us-east-1.elb.amazonaws.com/",
})