ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS meal_options JSONB DEFAULT '["Chicken", "Fish", "Vegetarian", "Vegan"]';
