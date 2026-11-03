const prisma = require('./prismaClient');
const UsersModel = require('../models/users.model');

// ---------------------------------------------------------------------
// Users (ids 1-6)
// ---------------------------------------------------------------------
const users = [
    { id: 1, first_name: 'John',  last_name: 'Doe',       email: 'john@fitwize.com',  password: 'password123', role: 'user'    },
    { id: 2, first_name: 'Noam',  last_name: 'Levi',      email: 'noam@fitwize.com',  password: 'password123', role: 'admin'   },
    { id: 3, first_name: 'Dana',  last_name: 'Cohen',     email: 'dana@fitwize.com',  password: 'password123', role: 'user'    },
    { id: 4, first_name: 'Roi',   last_name: 'Bublil',    email: 'roi@fitwize.com',   password: 'password123', role: 'manager' },
    { id: 5, first_name: 'Maya',  last_name: 'Ben-David', email: 'maya@fitwize.com',  password: 'password123', role: 'user'    },
    { id: 6, first_name: 'Eitan', last_name: 'Katz',      email: 'eitan@fitwize.com', password: 'password123', role: 'user'    }
];

// ---------------------------------------------------------------------
// Exercises (ids 1-7)
// ---------------------------------------------------------------------
const exercises = [
    { id: 1, name: 'Leg Press',        muscle_group: 'Legs',      difficulty: 'Beginner',     equipment: 'Machine',       description: 'A lower-body exercise that mainly targets the quadriceps, glutes, and hamstrings.' },
    { id: 2, name: 'Chest Press',      muscle_group: 'Chest',     difficulty: 'Beginner',     equipment: 'Machine',       description: 'An upper-body pushing exercise that mainly targets the chest muscles.' },
    { id: 3, name: 'Lat Pulldown',     muscle_group: 'Back',      difficulty: 'Beginner',     equipment: 'Machine',       description: 'An upper-body pulling exercise that mainly targets the back muscles, especially the lats.' },
    { id: 4, name: 'Shoulder Press',   muscle_group: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells',     description: 'An upper-body pushing exercise that mainly targets the shoulder muscles.' },
    { id: 5, name: 'Biceps Curl',      muscle_group: 'Biceps',    difficulty: 'Beginner',     equipment: 'Dumbbells',     description: 'An isolation exercise that targets the front upper-arm muscles.' },
    { id: 6, name: 'Triceps Pushdown', muscle_group: 'Triceps',   difficulty: 'Beginner',     equipment: 'Cable Machine', description: 'An isolation exercise that targets the back upper-arm muscles.' },
    { id: 7, name: 'Plank',            muscle_group: 'Core',      difficulty: 'Beginner',     equipment: 'Bodyweight',    description: 'A core stability exercise that strengthens the abdominal and trunk muscles.' },
    { id: 8,  name: 'Bench Press',                muscle_group: 'Chest',     difficulty: 'Intermediate', equipment: 'Barbell',        description: 'Classic compound chest exercise using a barbell.' },
    { id: 9,  name: 'Incline Bench Press',        muscle_group: 'Chest',     difficulty: 'Intermediate', equipment: 'Barbell',        description: 'Upper chest focused pressing exercise.' },
    { id: 10, name: 'Incline Dumbbell Press',     muscle_group: 'Chest',     difficulty: 'Intermediate', equipment: 'Dumbbells',      description: 'Upper chest pressing movement using dumbbells.' },
    { id: 11, name: 'Cable Fly',                  muscle_group: 'Chest',     difficulty: 'Beginner',     equipment: 'Cable Machine', description: 'Isolation movement targeting the chest muscles.' },
    { id: 12, name: 'Push Up',                    muscle_group: 'Chest',     difficulty: 'Beginner',     equipment: 'Bodyweight',    description: 'Bodyweight pushing exercise for chest and triceps.' },

    { id: 13, name: 'Seated Cable Row',           muscle_group: 'Back',      difficulty: 'Beginner',     equipment: 'Cable Machine', description: 'Horizontal pulling exercise targeting the back.' },
    { id: 14, name: 'Barbell Row',                muscle_group: 'Back',      difficulty: 'Intermediate', equipment: 'Barbell',        description: 'Compound rowing movement for back development.' },
    { id: 15, name: 'Dumbbell Row',               muscle_group: 'Back',      difficulty: 'Beginner',     equipment: 'Dumbbells',      description: 'Single-arm rowing exercise for back strength.' },
    { id: 16, name: 'Pull Up',                    muscle_group: 'Back',      difficulty: 'Advanced',     equipment: 'Bodyweight',    description: 'Bodyweight pulling exercise targeting lats.' },
    { id: 17, name: 'Machine Row',                muscle_group: 'Back',      difficulty: 'Beginner',     equipment: 'Machine',       description: 'Machine-based rowing movement.' },

    { id: 18, name: 'Lateral Raise',              muscle_group: 'Shoulders', difficulty: 'Beginner',     equipment: 'Dumbbells',      description: 'Isolation exercise targeting side deltoids.' },
    { id: 19, name: 'Front Raise',                muscle_group: 'Shoulders', difficulty: 'Beginner',     equipment: 'Dumbbells',      description: 'Isolation exercise targeting front deltoids.' },
    { id: 20, name: 'Rear Delt Fly',              muscle_group: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells',      description: 'Targets rear shoulder muscles.' },
    { id: 21, name: 'Arnold Press',               muscle_group: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells',      description: 'Rotational shoulder press exercise.' },
    { id: 22, name: 'Face Pull',                  muscle_group: 'Shoulders', difficulty: 'Beginner',     equipment: 'Cable Machine', description: 'Targets rear delts and upper back.' },

    { id: 23, name: 'Squat',                      muscle_group: 'Legs',      difficulty: 'Intermediate', equipment: 'Barbell',        description: 'Fundamental lower-body compound exercise.' },
    { id: 24, name: 'Hack Squat',                 muscle_group: 'Legs',      difficulty: 'Intermediate', equipment: 'Machine',       description: 'Machine squat variation.' },
    { id: 25, name: 'Bulgarian Split Squat',      muscle_group: 'Legs',      difficulty: 'Intermediate', equipment: 'Dumbbells',      description: 'Single-leg lower body exercise.' },
    { id: 26, name: 'Walking Lunges',             muscle_group: 'Legs',      difficulty: 'Beginner',     equipment: 'Dumbbells',      description: 'Dynamic lower body movement.' },
    { id: 27, name: 'Leg Extension',              muscle_group: 'Legs',      difficulty: 'Beginner',     equipment: 'Machine',       description: 'Isolation exercise for quadriceps.' },
    { id: 28, name: 'Leg Curl',                   muscle_group: 'Legs',      difficulty: 'Beginner',     equipment: 'Machine',       description: 'Isolation exercise for hamstrings.' },
    { id: 29, name: 'Romanian Deadlift',          muscle_group: 'Legs',      difficulty: 'Intermediate', equipment: 'Barbell',        description: 'Posterior chain exercise.' },
    { id: 30, name: 'Standing Calf Raise',        muscle_group: 'Calves',    difficulty: 'Beginner',     equipment: 'Machine',       description: 'Targets calf muscles.' },

    { id: 31, name: 'Hammer Curl',                muscle_group: 'Biceps',    difficulty: 'Beginner',     equipment: 'Dumbbells',      description: 'Biceps exercise with neutral grip.' },
    { id: 32, name: 'Preacher Curl',              muscle_group: 'Biceps',    difficulty: 'Intermediate', equipment: 'Machine',       description: 'Isolation curl exercise.' },
    { id: 33, name: 'Cable Curl',                 muscle_group: 'Biceps',    difficulty: 'Beginner',     equipment: 'Cable Machine', description: 'Cable-based curl variation.' },

    { id: 34, name: 'Overhead Triceps Extension', muscle_group: 'Triceps',   difficulty: 'Beginner',     equipment: 'Dumbbells',      description: 'Targets the long head of the triceps.' },
    { id: 35, name: 'Skull Crusher',              muscle_group: 'Triceps',   difficulty: 'Intermediate', equipment: 'Barbell',        description: 'Lying triceps extension exercise.' },
    { id: 36, name: 'Bench Dips',                 muscle_group: 'Triceps',   difficulty: 'Beginner',     equipment: 'Bodyweight',    description: 'Bodyweight triceps exercise.' },

    { id: 37, name: 'Crunch',                     muscle_group: 'Core',      difficulty: 'Beginner',     equipment: 'Bodyweight',    description: 'Basic abdominal exercise.' },
    { id: 38, name: 'Leg Raises',                 muscle_group: 'Core',      difficulty: 'Beginner',     equipment: 'Bodyweight',    description: 'Lower abdominal exercise.' },
    { id: 39, name: 'Russian Twist',              muscle_group: 'Core',      difficulty: 'Beginner',     equipment: 'Bodyweight',    description: 'Rotational core exercise.' },
    { id: 40, name: 'Mountain Climbers',          muscle_group: 'Core',      difficulty: 'Beginner',     equipment: 'Bodyweight',    description: 'Core and conditioning exercise.' }
];

// ---------------------------------------------------------------------
// Food items (ids 1-10)
// ---------------------------------------------------------------------
const foodItems = [
    { id: 1,  name: 'Chicken Breast', category: 'protein',   calories_per_100g: 165, protein_per_100g: 31,   carbs_per_100g: 0,    fat_per_100g: 3.6 },
    { id: 2,  name: 'Greek Yogurt',   category: 'dairy',     calories_per_100g: 59,  protein_per_100g: 10,   carbs_per_100g: 3.6,  fat_per_100g: 0.4 },
    { id: 3,  name: 'White Rice',     category: 'carb',      calories_per_100g: 130, protein_per_100g: 2.7,  carbs_per_100g: 28,   fat_per_100g: 0.3 },
    { id: 4,  name: 'Salmon',         category: 'protein',   calories_per_100g: 208, protein_per_100g: 20,   carbs_per_100g: 0,    fat_per_100g: 13 },
    { id: 5,  name: 'Egg',            category: 'protein',   calories_per_100g: 155, protein_per_100g: 13,   carbs_per_100g: 1.1,  fat_per_100g: 11 },
    { id: 6,  name: 'Oats',           category: 'carb',      calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fat_per_100g: 6.9 },
    { id: 7,  name: 'Avocado',        category: 'fat',       calories_per_100g: 160, protein_per_100g: 2,    carbs_per_100g: 8.5,  fat_per_100g: 14.7 },
    { id: 8,  name: 'Sweet Potato',   category: 'carb',      calories_per_100g: 86,  protein_per_100g: 1.6,  carbs_per_100g: 20,   fat_per_100g: 0.1 },
    { id: 9,  name: 'Cottage Cheese', category: 'dairy',     calories_per_100g: 98,  protein_per_100g: 11,   carbs_per_100g: 3.4,  fat_per_100g: 4.3 },
    { id: 10, name: 'Broccoli',       category: 'vegetable', calories_per_100g: 34,  protein_per_100g: 2.8,  carbs_per_100g: 6.6,  fat_per_100g: 0.4 },
    { id: 11, name: 'Lean Beef',          category: 'protein',   calories_per_100g: 217, protein_per_100g: 26, carbs_per_100g: 0,   fat_per_100g: 12 },
    { id: 12, name: 'Turkey Breast',      category: 'protein',   calories_per_100g: 135, protein_per_100g: 30, carbs_per_100g: 0,   fat_per_100g: 1 },
    { id: 13, name: 'Tuna',               category: 'protein',   calories_per_100g: 132, protein_per_100g: 29, carbs_per_100g: 0,   fat_per_100g: 1 },
    { id: 14, name: 'Cod',                category: 'protein',   calories_per_100g: 82,  protein_per_100g: 18, carbs_per_100g: 0,   fat_per_100g: 0.7 },
    { id: 15, name: 'Shrimp',             category: 'protein',   calories_per_100g: 99,  protein_per_100g: 24, carbs_per_100g: 0.2, fat_per_100g: 0.3 },
    { id: 16, name: 'Tofu',               category: 'protein',   calories_per_100g: 76,  protein_per_100g: 8,  carbs_per_100g: 1.9, fat_per_100g: 4.8 },

    { id: 17, name: 'Brown Rice',         category: 'carb',      calories_per_100g: 123, protein_per_100g: 2.7, carbs_per_100g: 25.6, fat_per_100g: 1 },
    { id: 18, name: 'Jasmine Rice',       category: 'carb',      calories_per_100g: 130, protein_per_100g: 2.5, carbs_per_100g: 28,   fat_per_100g: 0.3 },
    { id: 19, name: 'Basmati Rice',       category: 'carb',      calories_per_100g: 121, protein_per_100g: 3.5, carbs_per_100g: 25,   fat_per_100g: 0.4 },
    { id: 20, name: 'Whole Wheat Pasta',  category: 'carb',      calories_per_100g: 124, protein_per_100g: 5,   carbs_per_100g: 26,   fat_per_100g: 0.8 },
    { id: 21, name: 'Potato',             category: 'carb',      calories_per_100g: 77,  protein_per_100g: 2,   carbs_per_100g: 17,   fat_per_100g: 0.1 },
    { id: 22, name: 'Quinoa',             category: 'carb',      calories_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 21.3, fat_per_100g: 1.9 },

    { id: 23, name: 'Almonds',            category: 'fat',       calories_per_100g: 579, protein_per_100g: 21,  carbs_per_100g: 22,   fat_per_100g: 50 },
    { id: 24, name: 'Walnuts',            category: 'fat',       calories_per_100g: 654, protein_per_100g: 15,  carbs_per_100g: 14,   fat_per_100g: 65 },
    { id: 25, name: 'Peanut Butter',      category: 'fat',       calories_per_100g: 588, protein_per_100g: 25,  carbs_per_100g: 20,   fat_per_100g: 50 },
    { id: 26, name: 'Olive Oil',          category: 'fat',       calories_per_100g: 884, protein_per_100g: 0,   carbs_per_100g: 0,    fat_per_100g: 100 },

    { id: 27, name: 'Spinach',            category: 'vegetable', calories_per_100g: 23,  protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
    { id: 28, name: 'Cucumber',           category: 'vegetable', calories_per_100g: 15,  protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1 },
    { id: 29, name: 'Tomato',             category: 'vegetable', calories_per_100g: 18,  protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
    { id: 30, name: 'Bell Pepper',        category: 'vegetable', calories_per_100g: 31,  protein_per_100g: 1,   carbs_per_100g: 6,   fat_per_100g: 0.3 },

    { id: 31, name: 'Banana',             category: 'fruit',     calories_per_100g: 89,  protein_per_100g: 1.1, carbs_per_100g: 23,  fat_per_100g: 0.3 },
    { id: 32, name: 'Apple',              category: 'fruit',     calories_per_100g: 52,  protein_per_100g: 0.3, carbs_per_100g: 14,  fat_per_100g: 0.2 },
    { id: 33, name: 'Orange',             category: 'fruit',     calories_per_100g: 47,  protein_per_100g: 0.9, carbs_per_100g: 12,  fat_per_100g: 0.1 },
    { id: 34, name: 'Blueberries',        category: 'fruit',     calories_per_100g: 57,  protein_per_100g: 0.7, carbs_per_100g: 14,  fat_per_100g: 0.3 },

    { id: 35, name: 'Milk',               category: 'dairy',     calories_per_100g: 61,  protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 3.3 },
    { id: 36, name: 'Mozzarella Cheese',  category: 'dairy',     calories_per_100g: 280, protein_per_100g: 28,  carbs_per_100g: 3,   fat_per_100g: 17 },
    { id: 37, name: 'Feta Cheese',        category: 'dairy',     calories_per_100g: 264, protein_per_100g: 14,  carbs_per_100g: 4,   fat_per_100g: 21 },
    
];

// ---------------------------------------------------------------------
// Workout plans (ids 1-7) — one per user; ids 1-6 are the original templates,
// id 7 is Eitan Katz's plan added to fix the cross-user assignment
// ---------------------------------------------------------------------
const workoutPlans = [
    { id: 1, user_id: 1, plan_name: 'John Doe - 3 Day Muscle Gain Plan',       fitness_goal: 'muscle_gain', is_active: true, created_at: new Date('2026-05-05') },
    { id: 2, user_id: 3, plan_name: 'Dana Cohen - 3 Day Muscle Gain Plan',     fitness_goal: 'muscle_gain', is_active: true, created_at: new Date('2026-05-05') },
    { id: 3, user_id: 4, plan_name: 'Roi Bublil - 3 Day Weight Loss Plan',     fitness_goal: 'weight_loss', is_active: true, created_at: new Date('2026-05-05') },
    { id: 4, user_id: 2, plan_name: 'Noam Levi - 4 Day Weight Loss Plan',      fitness_goal: 'weight_loss', is_active: true, created_at: new Date('2026-05-05') },
    { id: 5, user_id: 5, plan_name: 'Maya Ben-David - 3 Day Maintenance Plan', fitness_goal: 'maintenance', is_active: true, created_at: new Date('2026-05-05') },
    { id: 6, user_id: 5, plan_name: 'Maya Ben-David - 5 Day Maintenance Plan', fitness_goal: 'maintenance', is_active: true, created_at: new Date('2026-05-05') },
    { id: 7, user_id: 6, plan_name: 'Eitan Katz - 3 Day Weight Loss Plan',     fitness_goal: 'weight_loss', is_active: true, created_at: new Date('2026-05-05') }
];

// ---------------------------------------------------------------------
// Workout plan days (ids 1-21)
// ---------------------------------------------------------------------
const workoutPlanDays = [
    { id: 1,  workout_plan_id: 1, day: 'Sunday',    workout_title: 'Full Body A' },
    { id: 2,  workout_plan_id: 1, day: 'Tuesday',   workout_title: 'Upper Body Focus' },
    { id: 3,  workout_plan_id: 1, day: 'Thursday',  workout_title: 'Full Body B' },

    { id: 4,  workout_plan_id: 2, day: 'Monday',    workout_title: 'Lower Body And Core' },
    { id: 5,  workout_plan_id: 2, day: 'Wednesday', workout_title: 'Upper Body Push' },
    { id: 6,  workout_plan_id: 2, day: 'Friday',    workout_title: 'Upper Body Pull' },

    { id: 7,  workout_plan_id: 3, day: 'Monday',    workout_title: 'Full Body Circuit A' },
    { id: 8,  workout_plan_id: 3, day: 'Wednesday', workout_title: 'Full Body Circuit B' },
    { id: 9,  workout_plan_id: 3, day: 'Friday',    workout_title: 'Full Body Circuit C' },

    { id: 10, workout_plan_id: 4, day: 'Monday',    workout_title: 'Lower Body' },
    { id: 11, workout_plan_id: 4, day: 'Tuesday',   workout_title: 'Upper Body Push' },
    { id: 12, workout_plan_id: 4, day: 'Thursday',  workout_title: 'Full Body' },
    { id: 13, workout_plan_id: 4, day: 'Friday',    workout_title: 'Upper Body Pull' },

    { id: 14, workout_plan_id: 5, day: 'Tuesday',   workout_title: 'Lower Body' },
    { id: 15, workout_plan_id: 5, day: 'Thursday',  workout_title: 'Upper Body' },
    { id: 16, workout_plan_id: 5, day: 'Saturday',  workout_title: 'Full Body' },

    { id: 17, workout_plan_id: 6, day: 'Monday',    workout_title: 'Chest And Triceps' },
    { id: 18, workout_plan_id: 6, day: 'Tuesday',   workout_title: 'Back And Biceps' },
    { id: 19, workout_plan_id: 6, day: 'Wednesday', workout_title: 'Legs And Core' },
    { id: 20, workout_plan_id: 6, day: 'Thursday',  workout_title: 'Shoulders And Arms' },
    { id: 21, workout_plan_id: 6, day: 'Friday',    workout_title: 'Full Body' },

    { id: 22, workout_plan_id: 7, day: 'Monday',    workout_title: 'Full Body Circuit A' },
    { id: 23, workout_plan_id: 7, day: 'Wednesday', workout_title: 'Full Body Circuit B' },
    { id: 24, workout_plan_id: 7, day: 'Friday',    workout_title: 'Full Body Circuit C' }
];

// ---------------------------------------------------------------------
// Plan exercises (ids 1-63)
// ---------------------------------------------------------------------
const planExercises = [
    { id: 1,  day_id: 1,  exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 10, target_weight: 80 },
    { id: 2,  day_id: 1,  exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 3, target_reps: 10, target_weight: 35 },
    { id: 3,  day_id: 1,  exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 10, target_weight: 40 },

    { id: 4,  day_id: 2,  exercise_id: 4, exercise_name: 'Shoulder Press',   target_sets: 3, target_reps: 10, target_weight: 12 },
    { id: 5,  day_id: 2,  exercise_id: 5, exercise_name: 'Biceps Curl',      target_sets: 3, target_reps: 12, target_weight: 10 },
    { id: 6,  day_id: 2,  exercise_id: 6, exercise_name: 'Triceps Pushdown', target_sets: 3, target_reps: 12, target_weight: 25 },

    { id: 7,  day_id: 3,  exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 4, target_reps: 8,  target_weight: 90 },
    { id: 8,  day_id: 3,  exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 8,  target_weight: 45 },
    { id: 9,  day_id: 3,  exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 45, target_weight: 0 },

    { id: 10, day_id: 4,  exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 12, target_weight: 60 },
    { id: 11, day_id: 4,  exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 40, target_weight: 0 },

    { id: 12, day_id: 5,  exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 3, target_reps: 10, target_weight: 25 },
    { id: 13, day_id: 5,  exercise_id: 4, exercise_name: 'Shoulder Press',   target_sets: 3, target_reps: 10, target_weight: 8 },
    { id: 14, day_id: 5,  exercise_id: 6, exercise_name: 'Triceps Pushdown', target_sets: 3, target_reps: 12, target_weight: 18 },

    { id: 15, day_id: 6,  exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 10, target_weight: 30 },
    { id: 16, day_id: 6,  exercise_id: 5, exercise_name: 'Biceps Curl',      target_sets: 3, target_reps: 12, target_weight: 7 },
    { id: 17, day_id: 6,  exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 45, target_weight: 0 },

    { id: 18, day_id: 7,  exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 15, target_weight: 60 },
    { id: 19, day_id: 7,  exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 3, target_reps: 15, target_weight: 20 },
    { id: 20, day_id: 7,  exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 15, target_weight: 30 },
    { id: 21, day_id: 7,  exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 30, target_weight: 0 },

    { id: 22, day_id: 8,  exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 12, target_weight: 65 },
    { id: 23, day_id: 8,  exercise_id: 4, exercise_name: 'Shoulder Press',   target_sets: 3, target_reps: 15, target_weight: 8 },
    { id: 24, day_id: 8,  exercise_id: 5, exercise_name: 'Biceps Curl',      target_sets: 3, target_reps: 15, target_weight: 6 },
    { id: 25, day_id: 8,  exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 30, target_weight: 0 },

    { id: 26, day_id: 9,  exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 3, target_reps: 15, target_weight: 20 },
    { id: 27, day_id: 9,  exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 15, target_weight: 30 },
    { id: 28, day_id: 9,  exercise_id: 6, exercise_name: 'Triceps Pushdown', target_sets: 3, target_reps: 15, target_weight: 15 },
    { id: 29, day_id: 9,  exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 45, target_weight: 0 },

    { id: 30, day_id: 10, exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 4, target_reps: 15, target_weight: 70 },
    { id: 31, day_id: 10, exercise_id: 7, exercise_name: 'Plank',            target_sets: 4, target_reps: 45, target_weight: 0 },

    { id: 32, day_id: 11, exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 3, target_reps: 15, target_weight: 25 },
    { id: 33, day_id: 11, exercise_id: 4, exercise_name: 'Shoulder Press',   target_sets: 3, target_reps: 15, target_weight: 10 },
    { id: 34, day_id: 11, exercise_id: 6, exercise_name: 'Triceps Pushdown', target_sets: 3, target_reps: 15, target_weight: 20 },

    { id: 35, day_id: 12, exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 15, target_weight: 75 },
    { id: 36, day_id: 12, exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 15, target_weight: 35 },
    { id: 37, day_id: 12, exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 45, target_weight: 0 },

    { id: 38, day_id: 13, exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 15, target_weight: 35 },
    { id: 39, day_id: 13, exercise_id: 5, exercise_name: 'Biceps Curl',      target_sets: 3, target_reps: 15, target_weight: 8 },
    { id: 40, day_id: 13, exercise_id: 4, exercise_name: 'Shoulder Press',   target_sets: 3, target_reps: 15, target_weight: 10 },

    { id: 41, day_id: 14, exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 10, target_weight: 80 },
    { id: 42, day_id: 14, exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 40, target_weight: 0 },

    { id: 43, day_id: 15, exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 3, target_reps: 10, target_weight: 30 },
    { id: 44, day_id: 15, exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 10, target_weight: 35 },
    { id: 45, day_id: 15, exercise_id: 4, exercise_name: 'Shoulder Press',   target_sets: 3, target_reps: 10, target_weight: 12 },

    { id: 46, day_id: 16, exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 10, target_weight: 80 },
    { id: 47, day_id: 16, exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 3, target_reps: 10, target_weight: 30 },
    { id: 48, day_id: 16, exercise_id: 5, exercise_name: 'Biceps Curl',      target_sets: 3, target_reps: 12, target_weight: 10 },
    { id: 49, day_id: 16, exercise_id: 6, exercise_name: 'Triceps Pushdown', target_sets: 3, target_reps: 12, target_weight: 20 },
    { id: 50, day_id: 16, exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 45, target_weight: 0 },

    { id: 51, day_id: 17, exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 4, target_reps: 10, target_weight: 40 },
    { id: 52, day_id: 17, exercise_id: 6, exercise_name: 'Triceps Pushdown', target_sets: 3, target_reps: 12, target_weight: 30 },

    { id: 53, day_id: 18, exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 4, target_reps: 10, target_weight: 50 },
    { id: 54, day_id: 18, exercise_id: 5, exercise_name: 'Biceps Curl',      target_sets: 3, target_reps: 12, target_weight: 12 },

    { id: 55, day_id: 19, exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 4, target_reps: 10, target_weight: 100 },
    { id: 56, day_id: 19, exercise_id: 7, exercise_name: 'Plank',            target_sets: 4, target_reps: 60, target_weight: 0 },

    { id: 57, day_id: 20, exercise_id: 4, exercise_name: 'Shoulder Press',   target_sets: 4, target_reps: 10, target_weight: 16 },
    { id: 58, day_id: 20, exercise_id: 5, exercise_name: 'Biceps Curl',      target_sets: 3, target_reps: 12, target_weight: 12 },
    { id: 59, day_id: 20, exercise_id: 6, exercise_name: 'Triceps Pushdown', target_sets: 3, target_reps: 12, target_weight: 30 },

    { id: 60, day_id: 21, exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 12, target_weight: 90 },
    { id: 61, day_id: 21, exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 3, target_reps: 12, target_weight: 35 },
    { id: 62, day_id: 21, exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 12, target_weight: 45 },
    { id: 63, day_id: 21, exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 60, target_weight: 0  },

    { id: 64, day_id: 22, exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 15, target_weight: 55 },
    { id: 65, day_id: 22, exercise_id: 2, exercise_name: 'Chest Press',      target_sets: 3, target_reps: 15, target_weight: 20 },
    { id: 66, day_id: 22, exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 30, target_weight: 0  },

    { id: 67, day_id: 23, exercise_id: 3, exercise_name: 'Lat Pulldown',     target_sets: 3, target_reps: 15, target_weight: 25 },
    { id: 68, day_id: 23, exercise_id: 5, exercise_name: 'Biceps Curl',      target_sets: 3, target_reps: 15, target_weight: 8  },
    { id: 69, day_id: 23, exercise_id: 7, exercise_name: 'Plank',            target_sets: 3, target_reps: 30, target_weight: 0  },

    { id: 70, day_id: 24, exercise_id: 1, exercise_name: 'Leg Press',        target_sets: 3, target_reps: 15, target_weight: 60 },
    { id: 71, day_id: 24, exercise_id: 4, exercise_name: 'Shoulder Press',   target_sets: 3, target_reps: 15, target_weight: 8  },
    { id: 72, day_id: 24, exercise_id: 6, exercise_name: 'Triceps Pushdown', target_sets: 3, target_reps: 15, target_weight: 15 }
];

// ---------------------------------------------------------------------
// Daily meal plans (ids 1-7) — one per user; ids 1-6 are the original templates,
// id 7 is Eitan Katz's plan added to fix the cross-user assignment
// ---------------------------------------------------------------------
const dailyMealPlans = [
    { id: 1, user_id: 1, plan_name: 'John Doe - Muscle Gain Daily Meal Plan',              fitness_goal: 'muscle_gain', target_calories: 2972, target_protein: 150, is_active: true, created_at: new Date('2026-05-05') },
    { id: 2, user_id: 3, plan_name: 'Dana Cohen - Muscle Gain Daily Meal Plan',            fitness_goal: 'muscle_gain', target_calories: 2393, target_protein: 120, is_active: true, created_at: new Date('2026-05-05') },
    { id: 3, user_id: 4, plan_name: 'Roi Bublil - Weight Loss Daily Meal Plan',            fitness_goal: 'weight_loss', target_calories: 2008, target_protein: 130, is_active: true, created_at: new Date('2026-05-05') },
    { id: 4, user_id: 2, plan_name: 'Noam Levi - Weight Loss Daily Meal Plan',             fitness_goal: 'weight_loss', target_calories: 2622, target_protein: 110, is_active: true, created_at: new Date('2026-05-05') },
    { id: 5, user_id: 5, plan_name: 'Maya Ben-David - Maintenance Daily Meal Plan',        fitness_goal: 'maintenance', target_calories: 2366, target_protein: 130, is_active: true, created_at: new Date('2026-05-05') },
    { id: 6, user_id: 5, plan_name: 'Maya Ben-David - Active Maintenance Daily Meal Plan', fitness_goal: 'maintenance', target_calories: 2366, target_protein: 150, is_active: true, created_at: new Date('2026-05-05') },
    { id: 7, user_id: 6, plan_name: 'Eitan Katz - Weight Loss Daily Meal Plan',           fitness_goal: 'weight_loss', target_calories: 1999, target_protein: 120, is_active: true, created_at: new Date('2026-05-05') }
];

// ---------------------------------------------------------------------
// Meals (ids 1-24)
// ---------------------------------------------------------------------
const meals = [
    { id: 1,  daily_meal_plan_id: 1, meal_type: 'Breakfast', title: 'Greek Yogurt With Oats',         estimated_calories: 667, estimated_protein: 35 },
    { id: 2,  daily_meal_plan_id: 1, meal_type: 'Lunch',     title: 'Chicken Breast With Rice',       estimated_calories: 910, estimated_protein: 55 },
    { id: 3,  daily_meal_plan_id: 1, meal_type: 'Dinner',    title: 'Salmon With Sweet Potato',       estimated_calories: 970, estimated_protein: 45 },
    { id: 4,  daily_meal_plan_id: 1, meal_type: 'Snack',     title: 'Cottage Cheese And Egg',         estimated_calories: 425, estimated_protein: 30 },

    { id: 5,  daily_meal_plan_id: 2, meal_type: 'Breakfast', title: 'Greek Yogurt Bowl',              estimated_calories: 538, estimated_protein: 30 },
    { id: 6,  daily_meal_plan_id: 2, meal_type: 'Lunch',     title: 'Chicken Rice Bowl',              estimated_calories: 778, estimated_protein: 45 },
    { id: 7,  daily_meal_plan_id: 2, meal_type: 'Dinner',    title: 'Eggs With Sweet Potato',         estimated_calories: 718, estimated_protein: 35 },
    { id: 8,  daily_meal_plan_id: 2, meal_type: 'Snack',     title: 'Cottage Cheese Snack',           estimated_calories: 359, estimated_protein: 25 },

    { id: 9,  daily_meal_plan_id: 3, meal_type: 'Breakfast', title: 'Oats And Greek Yogurt Bowl',     estimated_calories: 446, estimated_protein: 28 },
    { id: 10, daily_meal_plan_id: 3, meal_type: 'Lunch',     title: 'Chicken And Rice With Broccoli', estimated_calories: 647, estimated_protein: 68 },
    { id: 11, daily_meal_plan_id: 3, meal_type: 'Dinner',    title: 'Salmon And Sweet Potato',        estimated_calories: 625, estimated_protein: 40 },
    { id: 12, daily_meal_plan_id: 3, meal_type: 'Snack',     title: 'Cottage Cheese',                 estimated_calories: 290, estimated_protein: 29 },

    { id: 13, daily_meal_plan_id: 4, meal_type: 'Breakfast', title: 'Scrambled Eggs With Broccoli',   estimated_calories: 590, estimated_protein: 30 },
    { id: 14, daily_meal_plan_id: 4, meal_type: 'Lunch',     title: 'Chicken And Sweet Potato',       estimated_calories: 770, estimated_protein: 59 },
    { id: 15, daily_meal_plan_id: 4, meal_type: 'Dinner',    title: 'Salmon With Greek Yogurt',       estimated_calories: 819, estimated_protein: 50 },
    { id: 16, daily_meal_plan_id: 4, meal_type: 'Snack',     title: 'Greek Yogurt And Oats',          estimated_calories: 442, estimated_protein: 23 },

    { id: 17, daily_meal_plan_id: 5, meal_type: 'Breakfast', title: 'Oats With Egg And Avocado',      estimated_calories: 538, estimated_protein: 30 },
    { id: 18, daily_meal_plan_id: 5, meal_type: 'Lunch',     title: 'Chicken Rice Bowl With Avocado', estimated_calories: 753, estimated_protein: 65 },
    { id: 19, daily_meal_plan_id: 5, meal_type: 'Dinner',    title: 'Salmon With Sweet Potato',       estimated_calories: 753, estimated_protein: 42 },
    { id: 20, daily_meal_plan_id: 5, meal_type: 'Snack',     title: 'Cottage Cheese And Oats',        estimated_calories: 323, estimated_protein: 25 },

    { id: 21, daily_meal_plan_id: 6, meal_type: 'Breakfast', title: 'Oats Greek Yogurt And Egg',      estimated_calories: 568, estimated_protein: 35 },
    { id: 22, daily_meal_plan_id: 6, meal_type: 'Lunch',     title: 'Chicken Rice Bowl With Avocado', estimated_calories: 757, estimated_protein: 65 },
    { id: 23, daily_meal_plan_id: 6, meal_type: 'Dinner',    title: 'Salmon With Rice And Broccoli',  estimated_calories: 710, estimated_protein: 55 },
    { id: 24, daily_meal_plan_id: 6, meal_type: 'Snack',     title: 'Cottage Cheese With Oats',       estimated_calories: 331, estimated_protein: 28 },

    { id: 25, daily_meal_plan_id: 7, meal_type: 'Breakfast', title: 'Greek Yogurt With Oats',         estimated_calories: 540, estimated_protein: 28 },
    { id: 26, daily_meal_plan_id: 7, meal_type: 'Lunch',     title: 'Chicken Rice And Broccoli',      estimated_calories: 810, estimated_protein: 60 },
    { id: 27, daily_meal_plan_id: 7, meal_type: 'Dinner',    title: 'Salmon With Sweet Potato',       estimated_calories: 649, estimated_protein: 40 }
];

// ---------------------------------------------------------------------
// Meal food items (ids 1-56)
// ---------------------------------------------------------------------
const mealFoodItems = [
    { id: 1,  meal_id: 1,  food_item_id: 2,  food_name: 'Greek Yogurt',   quantity_grams: 303.3 },
    { id: 2,  meal_id: 1,  food_item_id: 6,  food_name: 'Oats',           quantity_grams: 72.8 },

    { id: 3,  meal_id: 2,  food_item_id: 1,  food_name: 'Chicken Breast', quantity_grams: 218.4 },
    { id: 4,  meal_id: 2,  food_item_id: 3,  food_name: 'White Rice',     quantity_grams: 303.3 },

    { id: 5,  meal_id: 3,  food_item_id: 4,  food_name: 'Salmon',         quantity_grams: 218.4 },
    { id: 6,  meal_id: 3,  food_item_id: 8,  food_name: 'Sweet Potato',   quantity_grams: 303.3 },

    { id: 7,  meal_id: 4,  food_item_id: 9,  food_name: 'Cottage Cheese', quantity_grams: 242.6 },
    { id: 8,  meal_id: 4,  food_item_id: 5,  food_name: 'Egg',            quantity_grams: 60.7 },

    { id: 9,  meal_id: 5,  food_item_id: 2,  food_name: 'Greek Yogurt',   quantity_grams: 263.2 },
    { id: 10, meal_id: 5,  food_item_id: 6,  food_name: 'Oats',           quantity_grams: 53.8 },

    { id: 11, meal_id: 6,  food_item_id: 1,  food_name: 'Chicken Breast', quantity_grams: 179.5 },
    { id: 12, meal_id: 6,  food_item_id: 3,  food_name: 'White Rice',     quantity_grams: 263.2 },
    { id: 13, meal_id: 6,  food_item_id: 10, food_name: 'Broccoli',       quantity_grams: 179.5 },

    { id: 14, meal_id: 7,  food_item_id: 5,  food_name: 'Egg',            quantity_grams: 119.7 },
    { id: 15, meal_id: 7,  food_item_id: 8,  food_name: 'Sweet Potato',   quantity_grams: 299.1 },
    { id: 16, meal_id: 7,  food_item_id: 10, food_name: 'Broccoli',       quantity_grams: 179.5 },

    { id: 17, meal_id: 8,  food_item_id: 9,  food_name: 'Cottage Cheese', quantity_grams: 239.3 },

    { id: 18, meal_id: 9,  food_item_id: 6,  food_name: 'Oats',           quantity_grams: 89.2 },
    { id: 19, meal_id: 9,  food_item_id: 2,  food_name: 'Greek Yogurt',   quantity_grams: 167.3 },

    { id: 20, meal_id: 10, food_item_id: 1,  food_name: 'Chicken Breast', quantity_grams: 223.1 },
    { id: 21, meal_id: 10, food_item_id: 3,  food_name: 'White Rice',     quantity_grams: 167.3 },
    { id: 22, meal_id: 10, food_item_id: 10, food_name: 'Broccoli',       quantity_grams: 167.3 },

    { id: 23, meal_id: 11, food_item_id: 4,  food_name: 'Salmon',         quantity_grams: 200.8 },
    { id: 24, meal_id: 11, food_item_id: 8,  food_name: 'Sweet Potato',   quantity_grams: 278.9 },

    { id: 25, meal_id: 12, food_item_id: 9,  food_name: 'Cottage Cheese', quantity_grams: 295.6 },

    { id: 26, meal_id: 13, food_item_id: 5,  food_name: 'Egg',            quantity_grams: 327.8 },
    { id: 27, meal_id: 13, food_item_id: 10, food_name: 'Broccoli',       quantity_grams: 245.8 },

    { id: 28, meal_id: 14, food_item_id: 1,  food_name: 'Chicken Breast', quantity_grams: 295.0 },
    { id: 29, meal_id: 14, food_item_id: 8,  food_name: 'Sweet Potato',   quantity_grams: 327.8 },
    { id: 30, meal_id: 14, food_item_id: 10, food_name: 'Broccoli',       quantity_grams: 163.9 },

    { id: 31, meal_id: 15, food_item_id: 4,  food_name: 'Salmon',         quantity_grams: 245.8 },
    { id: 32, meal_id: 15, food_item_id: 2,  food_name: 'Greek Yogurt',   quantity_grams: 327.8 },

    { id: 33, meal_id: 16, food_item_id: 2,  food_name: 'Greek Yogurt',   quantity_grams: 327.8 },
    { id: 34, meal_id: 16, food_item_id: 6,  food_name: 'Oats',           quantity_grams: 49.2 },

    { id: 35, meal_id: 17, food_item_id: 6,  food_name: 'Oats',           quantity_grams: 86.0 },
    { id: 36, meal_id: 17, food_item_id: 5,  food_name: 'Egg',            quantity_grams: 107.5 },
    { id: 37, meal_id: 17, food_item_id: 7,  food_name: 'Avocado',        quantity_grams: 86.0 },

    { id: 38, meal_id: 18, food_item_id: 1,  food_name: 'Chicken Breast', quantity_grams: 215.1 },
    { id: 39, meal_id: 18, food_item_id: 3,  food_name: 'White Rice',     quantity_grams: 268.9 },
    { id: 40, meal_id: 18, food_item_id: 7,  food_name: 'Avocado',        quantity_grams: 86.0 },

    { id: 41, meal_id: 19, food_item_id: 4,  food_name: 'Salmon',         quantity_grams: 215.1 },
    { id: 42, meal_id: 19, food_item_id: 8,  food_name: 'Sweet Potato',   quantity_grams: 322.6 },
    { id: 43, meal_id: 19, food_item_id: 10, food_name: 'Broccoli',       quantity_grams: 215.1 },

    { id: 44, meal_id: 20, food_item_id: 9,  food_name: 'Cottage Cheese', quantity_grams: 215.1 },
    { id: 45, meal_id: 20, food_item_id: 6,  food_name: 'Oats',           quantity_grams: 21.5 },

    { id: 46, meal_id: 21, food_item_id: 6,  food_name: 'Oats',           quantity_grams: 94.6 },
    { id: 47, meal_id: 21, food_item_id: 2,  food_name: 'Greek Yogurt',   quantity_grams: 236.6 },
    { id: 48, meal_id: 21, food_item_id: 5,  food_name: 'Egg',            quantity_grams: 94.6 },

    { id: 49, meal_id: 22, food_item_id: 1,  food_name: 'Chicken Breast', quantity_grams: 236.6 },
    { id: 50, meal_id: 22, food_item_id: 3,  food_name: 'White Rice',     quantity_grams: 265.0 },
    { id: 51, meal_id: 22, food_item_id: 7,  food_name: 'Avocado',        quantity_grams: 94.6 },

    { id: 52, meal_id: 23, food_item_id: 4,  food_name: 'Salmon',         quantity_grams: 189.3 },
    { id: 53, meal_id: 23, food_item_id: 3,  food_name: 'White Rice',     quantity_grams: 189.3 },
    { id: 54, meal_id: 23, food_item_id: 10, food_name: 'Broccoli',       quantity_grams: 189.3 },

    { id: 55, meal_id: 24, food_item_id: 9,  food_name: 'Cottage Cheese', quantity_grams: 236.6 },
    { id: 56, meal_id: 24, food_item_id: 6,  food_name: 'Oats',           quantity_grams: 28.4  },

    { id: 57, meal_id: 25, food_item_id: 2,  food_name: 'Greek Yogurt',   quantity_grams: 200.0 },
    { id: 58, meal_id: 25, food_item_id: 6,  food_name: 'Oats',           quantity_grams: 87.0  },

    { id: 59, meal_id: 26, food_item_id: 1,  food_name: 'Chicken Breast', quantity_grams: 275.0 },
    { id: 60, meal_id: 26, food_item_id: 3,  food_name: 'White Rice',     quantity_grams: 220.0 },
    { id: 61, meal_id: 26, food_item_id: 10, food_name: 'Broccoli',       quantity_grams: 150.0 },

    { id: 62, meal_id: 27, food_item_id: 4,  food_name: 'Salmon',         quantity_grams: 210.0 },
    { id: 63, meal_id: 27, food_item_id: 8,  food_name: 'Sweet Potato',   quantity_grams: 280.0 }
];

// ---------------------------------------------------------------------
// Profiles (ids 1-6) - each assigned_workout_plan_id / assigned_meal_plan_id
// references a plan owned by the same user (ids 1-7)
// ---------------------------------------------------------------------
const profiles = [
    { id: 1, user_id: 1, age: 25, gender: 'male',   height_cm: 175, current_weight: 75, target_weight: 80, fitness_goal: 'muscle_gain', activity_level: 'intermediate', workouts_per_week: 3, meals_per_day: 4, onboarding_completed: true, caloric_target: 2972, assigned_workout_plan_id: 1, assigned_meal_plan_id: 1 },
    { id: 2, user_id: 2, age: 28, gender: 'male',   height_cm: 180, current_weight: 82, target_weight: 78, fitness_goal: 'weight_loss', activity_level: 'advanced',     workouts_per_week: 4, meals_per_day: 4, onboarding_completed: true, caloric_target: 2622, assigned_workout_plan_id: 4, assigned_meal_plan_id: 4 },
    { id: 3, user_id: 3, age: 24, gender: 'female', height_cm: 165, current_weight: 60, target_weight: 65, fitness_goal: 'muscle_gain', activity_level: 'intermediate', workouts_per_week: 3, meals_per_day: 5, onboarding_completed: true, caloric_target: 2393, assigned_workout_plan_id: 2, assigned_meal_plan_id: 2 },
    { id: 4, user_id: 4, age: 35, gender: 'male',   height_cm: 175, current_weight: 90, target_weight: 82, fitness_goal: 'weight_loss', activity_level: 'beginner',     workouts_per_week: 3, meals_per_day: 3, onboarding_completed: true, caloric_target: 2008, assigned_workout_plan_id: 3, assigned_meal_plan_id: 3 },
    { id: 5, user_id: 5, age: 22, gender: 'female', height_cm: 170, current_weight: 58, target_weight: 58, fitness_goal: 'maintenance', activity_level: 'advanced',     workouts_per_week: 5, meals_per_day: 5, onboarding_completed: true, caloric_target: 2366, assigned_workout_plan_id: 6, assigned_meal_plan_id: 5 },
    { id: 6, user_id: 6, age: 30, gender: 'male',   height_cm: 178, current_weight: 85, target_weight: 80, fitness_goal: 'weight_loss', activity_level: 'beginner',     workouts_per_week: 3, meals_per_day: 3, onboarding_completed: true, caloric_target: 1999, assigned_workout_plan_id: 7, assigned_meal_plan_id: 7 }
];

// ---------------------------------------------------------------------
// Settings (ids 1-6)
// ---------------------------------------------------------------------
const settings = [
    { id: 1, user_id: 1, display_name: 'John Doe',       email: 'john@fitwize.com',  theme: 'light' },
    { id: 2, user_id: 2, display_name: 'Noam Levi',      email: 'noam@fitwize.com',  theme: 'dark'  },
    { id: 3, user_id: 3, display_name: 'Dana Cohen',     email: 'dana@fitwize.com',  theme: 'light' },
    { id: 4, user_id: 4, display_name: 'Roi Bublil',     email: 'roi@fitwize.com',   theme: 'light' },
    { id: 5, user_id: 5, display_name: 'Maya Ben-David', email: 'maya@fitwize.com',  theme: 'light' },
    { id: 6, user_id: 6, display_name: 'Eitan Katz',     email: 'eitan@fitwize.com', theme: 'dark'  }
];

// ---------------------------------------------------------------------
// Check-ins (ids 1-36) — 6 weekly check-ins per user, dates going back
// 6 weeks. Weights reflect each user's fitness goal trend.
// ---------------------------------------------------------------------
const checkIns = [
    // User 1 — John, muscle_gain — ✅ ON TRACK: steady weight gain
    { id: 1,  user_id: 1, weight: 75.0, workouts_completed: 4, feedback: 'Feeling strong, starting the program',     check_in_date: new Date('2026-05-05T08:00:00') },
    { id: 2,  user_id: 1, weight: 75.4, workouts_completed: 4, feedback: 'Good week, energy levels up',              check_in_date: new Date('2026-05-12T08:00:00') },
    { id: 3,  user_id: 1, weight: 75.8, workouts_completed: 3, feedback: 'Slightly tired but pushing through',       check_in_date: new Date('2026-05-19T08:00:00') },
    { id: 4,  user_id: 1, weight: 76.2, workouts_completed: 4, feedback: 'Strength increasing noticeably',           check_in_date: new Date('2026-05-26T08:00:00') },
    { id: 5,  user_id: 1, weight: 76.5, workouts_completed: 4, feedback: 'Great progress this month',                check_in_date: new Date('2026-06-02T08:00:00') },
    { id: 6,  user_id: 1, weight: 76.9, workouts_completed: 4, feedback: 'Feeling bigger and stronger',              check_in_date: new Date('2026-06-09T08:00:00') },

    // User 2 — Noam, weight_loss — ❌ NEEDS ADJUSTMENT: plateau then gaining
    { id: 7,  user_id: 2, weight: 82.0, workouts_completed: 5, feedback: 'Starting strong',                          check_in_date: new Date('2026-05-05T08:00:00') },
    { id: 8,  user_id: 2, weight: 81.8, workouts_completed: 5, feedback: 'Slight drop, good',                        check_in_date: new Date('2026-05-12T08:00:00') },
    { id: 9,  user_id: 2, weight: 81.9, workouts_completed: 4, feedback: 'Weight not moving much',                   check_in_date: new Date('2026-05-19T08:00:00') },
    { id: 10, user_id: 2, weight: 82.1, workouts_completed: 3, feedback: 'Missed some workouts, ate more',           check_in_date: new Date('2026-05-26T08:00:00') },
    { id: 11, user_id: 2, weight: 82.4, workouts_completed: 4, feedback: 'Frustrated, weight going up',              check_in_date: new Date('2026-06-02T08:00:00') },
    { id: 12, user_id: 2, weight: 82.7, workouts_completed: 4, feedback: 'Not sure what is happening',               check_in_date: new Date('2026-06-09T08:00:00') },

    // User 3 — Dana, muscle_gain — ✅ ON TRACK: slow steady gain
    { id: 13, user_id: 3, weight: 60.0, workouts_completed: 3, feedback: 'Starting fresh',                           check_in_date: new Date('2026-05-05T08:00:00') },
    { id: 14, user_id: 3, weight: 60.2, workouts_completed: 3, feedback: 'Eating more protein',                      check_in_date: new Date('2026-05-12T08:00:00') },
    { id: 15, user_id: 3, weight: 60.4, workouts_completed: 3, feedback: 'Strength improving',                       check_in_date: new Date('2026-05-19T08:00:00') },
    { id: 16, user_id: 3, weight: 60.6, workouts_completed: 3, feedback: 'Consistent progress',                      check_in_date: new Date('2026-05-26T08:00:00') },
    { id: 17, user_id: 3, weight: 60.9, workouts_completed: 3, feedback: 'Feeling stronger each week',               check_in_date: new Date('2026-06-02T08:00:00') },
    { id: 18, user_id: 3, weight: 61.1, workouts_completed: 3, feedback: 'Happy with the progress',                  check_in_date: new Date('2026-06-09T08:00:00') },

    // User 4 — Roi, weight_loss — ✅ ON TRACK: consistent steady loss
    { id: 19, user_id: 4, weight: 90.0, workouts_completed: 3, feedback: 'Starting the journey',                     check_in_date: new Date('2026-05-05T08:00:00') },
    { id: 20, user_id: 4, weight: 89.1, workouts_completed: 3, feedback: 'Diet on track, feeling good',              check_in_date: new Date('2026-05-12T08:00:00') },
    { id: 21, user_id: 4, weight: 88.3, workouts_completed: 3, feedback: 'Consistent, getting easier',               check_in_date: new Date('2026-05-19T08:00:00') },
    { id: 22, user_id: 4, weight: 87.4, workouts_completed: 3, feedback: 'Clothes fitting better',                   check_in_date: new Date('2026-05-26T08:00:00') },
    { id: 23, user_id: 4, weight: 86.6, workouts_completed: 3, feedback: 'Very motivated',                           check_in_date: new Date('2026-06-02T08:00:00') },
    { id: 24, user_id: 4, weight: 85.8, workouts_completed: 3, feedback: 'Steady and sustainable',                   check_in_date: new Date('2026-06-09T08:00:00') },

    // User 5 — Maya, maintenance — ✅ ON TRACK: stable weight
    { id: 25, user_id: 5, weight: 58.0, workouts_completed: 5, feedback: 'All good',                                 check_in_date: new Date('2026-05-05T08:00:00') },
    { id: 26, user_id: 5, weight: 58.1, workouts_completed: 5, feedback: 'Stable as expected',                       check_in_date: new Date('2026-05-12T08:00:00') },
    { id: 27, user_id: 5, weight: 57.9, workouts_completed: 5, feedback: 'Normal fluctuation',                       check_in_date: new Date('2026-05-19T08:00:00') },
    { id: 28, user_id: 5, weight: 58.0, workouts_completed: 4, feedback: 'Perfectly on track',                       check_in_date: new Date('2026-05-26T08:00:00') },
    { id: 29, user_id: 5, weight: 58.2, workouts_completed: 5, feedback: 'Feeling great',                            check_in_date: new Date('2026-06-02T08:00:00') },
    { id: 30, user_id: 5, weight: 58.0, workouts_completed: 5, feedback: 'Maintaining perfectly',                    check_in_date: new Date('2026-06-09T08:00:00') },

    // User 6 — Eitan, weight_loss — ❌ NEEDS ADJUSTMENT: consistently gaining
    { id: 31, user_id: 6, weight: 85.0, workouts_completed: 2, feedback: 'Starting out',                             check_in_date: new Date('2026-05-05T08:00:00') },
    { id: 32, user_id: 6, weight: 85.4, workouts_completed: 2, feedback: 'Hard to stick to the diet',               check_in_date: new Date('2026-05-12T08:00:00') },
    { id: 33, user_id: 6, weight: 85.9, workouts_completed: 1, feedback: 'Busy week, ate out a lot',                check_in_date: new Date('2026-05-19T08:00:00') },
    { id: 34, user_id: 6, weight: 86.3, workouts_completed: 2, feedback: 'Weight keeps going up',                   check_in_date: new Date('2026-05-26T08:00:00') },
    { id: 35, user_id: 6, weight: 86.7, workouts_completed: 2, feedback: 'Discouraged',                             check_in_date: new Date('2026-06-02T08:00:00') },
    { id: 36, user_id: 6, weight: 87.1, workouts_completed: 1, feedback: 'Need help, nothing is working',           check_in_date: new Date('2026-06-09T08:00:00') },
];

async function main() {
    console.log('Seeding database...');

    // Clean slate, children first, so the script is safe to rerun.
    await prisma.logSet.deleteMany();
    await prisma.logExercise.deleteMany();
    await prisma.mealFoodItem.deleteMany();
    await prisma.meal.deleteMany();
    await prisma.planExercise.deleteMany();
    await prisma.aiRecommendation.deleteMany();
    await prisma.checkIn.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.workoutLog.deleteMany();
    await prisma.workoutPlanDay.deleteMany();
    await prisma.setting.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.dailyMealPlan.deleteMany();
    await prisma.workoutPlan.deleteMany();
    await prisma.foodItem.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.supportMessage.deleteMany();
    await prisma.supportConversation.deleteMany();
    await prisma.userPresence.deleteMany();
    await prisma.user.deleteMany();

    // Recreate, parent before child, with explicit ids preserved.
    // Demo accounts share one plaintext password; store only its bcrypt hash.
    const demoHashes = await Promise.all(users.map(u => UsersModel.hashPassword(u.password)));
    await prisma.user.createMany({
        data: users.map((u, i) => ({ ...u, password: demoHashes[i] }))
    });
    console.log(`Seeded ${users.length} users`);

    await prisma.exercise.createMany({ data: exercises });
    console.log(`Seeded ${exercises.length} exercises`);

    await prisma.foodItem.createMany({ data: foodItems });
    console.log(`Seeded ${foodItems.length} food items`);

    await prisma.workoutPlan.createMany({ data: workoutPlans });
    console.log(`Seeded ${workoutPlans.length} workout plans (ids 1-7)`);

    await prisma.workoutPlanDay.createMany({ data: workoutPlanDays });
    console.log(`Seeded ${workoutPlanDays.length} workout plan days`);

    await prisma.planExercise.createMany({ data: planExercises });
    console.log(`Seeded ${planExercises.length} plan exercises`);

    await prisma.dailyMealPlan.createMany({ data: dailyMealPlans });
    console.log(`Seeded ${dailyMealPlans.length} daily meal plans (ids 1-7)`);

    await prisma.meal.createMany({ data: meals });
    console.log(`Seeded ${meals.length} meals`);

    await prisma.mealFoodItem.createMany({ data: mealFoodItems });
    console.log(`Seeded ${mealFoodItems.length} meal food items`);

    await prisma.profile.createMany({ data: profiles });
    console.log(`Seeded ${profiles.length} profiles`);

    await prisma.setting.createMany({ data: settings });
    console.log(`Seeded ${settings.length} settings`);

    await prisma.checkIn.createMany({ data: checkIns });
    console.log(`Seeded ${checkIns.length} check-ins`);

    // Sync profile.current_weight to each user's latest seeded check-in.
    // createMany bypasses the controller sync logic, so we do it explicitly here.
    const userIds = [...new Set(checkIns.map(ci => ci.user_id))];
    for (const userId of userIds) {
        const userCheckIns = checkIns.filter(ci => ci.user_id === userId);
        const latest = userCheckIns.reduce((a, b) =>
            new Date(a.check_in_date) >= new Date(b.check_in_date) ? a : b
        );
        await prisma.profile.update({
            where: { user_id: userId },
            data: { current_weight: latest.weight }
        });
    }
    console.log('Synced profile.current_weight to latest check-in weights');

    // -----------------------------------------------------------------------
    // Support conversations, messages, and presence
    // -----------------------------------------------------------------------

    // Create presence records for all users (offline by default)
    await prisma.userPresence.createMany({
        data: users.map(u => ({
            user_id:  u.id,
            is_online: false,
            last_seen: new Date(),
        }))
    });
    console.log(`Seeded ${users.length} user presence records`);

    // Create conversations for regular users only (ids 1, 3, 5, 6)
    const regularUserIds = users.filter(u => u.role === 'user').map(u => u.id);
    await prisma.supportConversation.createMany({
        data: regularUserIds.map((uid, i) => ({
            id:      i + 1,
            user_id: uid,
        }))
    });
    console.log(`Seeded ${regularUserIds.length} support conversations`);

    // Sample messages — John (user 1) conv id 1, Dana (user 3) conv id 2
    await prisma.supportMessage.createMany({
        data: [
            // John's conversation with support
            { conversation_id: 1, sender_id: 1, sender_role: 'user',    message: 'Hi, I need help adjusting my workout plan.' },
            { conversation_id: 1, sender_id: 4, sender_role: 'manager', message: 'Of course! What would you like to change?' },
            { conversation_id: 1, sender_id: 1, sender_role: 'user',    message: 'Can I add more cardio days?' },
            { conversation_id: 1, sender_id: 4, sender_role: 'manager', message: 'Absolutely, I\'ve updated your plan. Refresh the page to see the changes.' },
            // Dana's question
            { conversation_id: 2, sender_id: 3, sender_role: 'user',    message: 'Hello, I have a question about my meal plan.' },
            { conversation_id: 2, sender_id: 2, sender_role: 'admin',   message: 'Hi Dana! Happy to help. What\'s the question?' },
        ]
    });
    console.log('Seeded sample support messages');

    // Update conversation timestamps to match the last message
    await prisma.supportConversation.update({ where: { id: 1 }, data: { updated_at: new Date() } });
    await prisma.supportConversation.update({ where: { id: 2 }, data: { updated_at: new Date() } });

    console.log('Seeding complete.');
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
