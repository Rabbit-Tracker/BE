<!-- 실행예시 -->

psql "$DATABASE_URL" -f BE/sql/seed_users_dummy.sql

$ cd /Users/{id}/Rabbit-Tracker
export DATABASE_URL='postgresql://rabbit:rabbit123@localhost:5432/rabbit_tracker'
