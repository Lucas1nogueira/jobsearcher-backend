import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = "https://piloterr.com/api/v2/linkedin/job/search";
const API_KEY = process.env.PILOTERR_API_KEY;

export const fetchJobs = async (
  keyword: string,
  experience_level?: string,
  job_type?: string,
  when?: string,
  flexibility?: string,
  distance?: number,
  geo_id: string = "92000000",
  company_id?: string,
  page: number = 1
): Promise<any> => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        "x-api-key": API_KEY as string,
      },
      params: {
        keyword,
        experience_level,
        job_type,
        when,
        flexibility,
        distance,
        geo_id,
        company_id,
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Piloterr API:", error);
    throw error;
  }
};
