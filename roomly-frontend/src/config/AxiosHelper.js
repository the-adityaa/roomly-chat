import axios from "axios";

export const baseURL = "https://roomly-backend-ft99.onrender.com";
// export const baseURL = "http://localhost:8080";


export const httpClient = axios.create({
  baseURL,
});
