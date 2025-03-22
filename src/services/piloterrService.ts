import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_SEARCH_URL = process.env.PILOTERR_API_SEARCH_URL;
const API_JOB_INFO_URL = process.env.PILOTERR_API_JOB_INFO_URL;
const API_KEY = process.env.PILOTERR_API_KEY;

export const fetchJobs = async (keyword?: string): Promise<any> => {
  try {
    const response = await axios.get(API_SEARCH_URL as string, {
      headers: {
        "x-api-key": API_KEY as string,
      },
      params: { keyword },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs from Piloterr API:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error fetching jobs from Piloterr API."
    );
  }
};

export const fetchJobDescription = async (url: string): Promise<any> => {
  try {
    const response = await axios.get(API_JOB_INFO_URL as string, {
      headers: {
        "x-api-key": API_KEY as string,
      },
      params: { query: url },
    });
    return response.data.job_description;
  } catch (error) {
    console.error("Error fetching job info from Piloterr API:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error fetching job info from Piloterr API."
    );
  }
};
