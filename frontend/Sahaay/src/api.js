import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// GET needs
export const getNeeds = async () => {
  const res = await api.get("/needs");
  return res.data;
};

// GET volunteers
export const getVolunteers = async () => {
  const res = await api.get("/volunteers");
  return res.data;
};

// POST smart match
export const runMatch = async () => {
  try {
    const res = await axios.post(
      "http://localhost:8000/api/smart-match",
      {
        task_id: "t1",
        task_details: "Need a volunteer to deliver medical supplies urgently"
      }
    );

    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};

export default api;