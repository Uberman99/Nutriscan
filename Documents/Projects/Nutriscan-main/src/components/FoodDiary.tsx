import React, { useState, useEffect } from 'react';

interface FoodLog {
  id: number;
  foodName: string;
  calories: number;
  nutrients: string;
}

const FoodDiary = () => {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);

  useEffect(() => {
    // Fetch food logs from the backend
    const fetchFoodLogs = async () => {
      const response = await fetch('/api/food-logs');
      const data: FoodLog[] = await response.json();
      setFoodLogs(data);
    };

    fetchFoodLogs();
  }, []);

  const handleAddLog = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newLog = {
      foodName: formData.get('foodName') as string,
      calories: parseInt(formData.get('calories') as string, 10),
      nutrients: formData.get('nutrients') as string,
    };

    const response = await fetch('/api/food-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLog),
    });

    if (response.ok) {
      const addedLog: FoodLog = await response.json();
      setFoodLogs((prevLogs) => [...prevLogs, addedLog]);
    }
  };

  return (
    <div>
      <h1>Food Diary</h1>
      <form onSubmit={handleAddLog}>
        <input type="text" name="foodName" placeholder="Food Name" required />
        <input type="number" name="calories" placeholder="Calories" required />
        <textarea name="nutrients" placeholder="Nutrients (JSON format)" required></textarea>
        <button type="submit">Add Log</button>
      </form>

      <ul>
        {foodLogs.map((log) => (
          <li key={log.id}>
            <strong>{log.foodName}</strong>: {log.calories} calories
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoodDiary;
