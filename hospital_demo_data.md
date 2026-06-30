# 🏥 Global Apex Multispeciality Hospital - Extended Setup Data

Use the tables below to manually populate your MedLayer system with a large-scale, enterprise-level dataset, featuring a legendary cast of 12 Doctors and 35 Patients from *Game of Thrones*, *House of the Dragon*, and *A Knight of the Seven Kingdoms*.

## 1. Clinic Registration (Master Account)
First, register the clinic from the `/register` page.

| Field | Value |
| :--- | :--- |
| **Clinic Name** | Global Apex Multispeciality |
| **Master Admin Email** | admin@globalapex.com |
| **Admin Password** | Admin@123 |

*(After registering, log in as **Admin** with the credentials above to configure the rest).*

---

## 2. Clinic Configuration (Settings)
Navigate to **Settings** in the Admin dashboard.

| Parameter | Value |
| :--- | :--- |
| **Opening Time** | 08:00 |
| **Closing Time** | 20:00 |
| **Working Days** | MON, TUE, WED, THU, FRI, SAT |

---

## 3. Staff Accounts (Users)
Navigate to **Staff Management**. First create the Receptionist, then the 12 Doctors.

| Full Name | Role | Email | Password | Linked Doctor |
| :--- | :--- | :--- | :--- | :--- |
| Samwell Tarly | Receptionist | frontdesk@citadel.com | Pass@123 | *(None)* |
| Dr. Maester Aemon | Doctor | aemon@citadel.com | Pass@123 | *(Link later)* |
| Dr. Qyburn | Doctor | qyburn@citadel.com | Pass@123 | *(Link later)* |
| Dr. Corlys Velaryon | Doctor | cvelaryon@citadel.com | Pass@123 | *(Link later)* |
| Dr. Rhaenyra Targaryen | Doctor | rtargaryen@citadel.com | Pass@123 | *(Link later)* |
| Dr. Alicent Hightower | Doctor | ahightower@citadel.com | Pass@123 | *(Link later)* |
| Dr. Daemon Targaryen | Doctor | dtargaryen@citadel.com | Pass@123 | *(Link later)* |
| Dr. Ser Duncan the Tall | Doctor | duncan@citadel.com | Pass@123 | *(Link later)* |
| Dr. Melisandre | Doctor | melisandre@citadel.com | Pass@123 | *(Link later)* |
| Dr. Otto Hightower | Doctor | ohightower@citadel.com | Pass@123 | *(Link later)* |
| Dr. Grand Maester Pycelle| Doctor | pycelle@citadel.com | Pass@123 | *(Link later)* |
| Dr. Viserys Targaryen | Doctor | vtargaryen@citadel.com | Pass@123 | *(Link later)* |
| Dr. Aegon the Conqueror | Doctor | aegon.c@citadel.com | Pass@123 | *(Link later)* |

---

## 4. Doctor Profiles & Availability
Navigate to **Doctors** to create the medical personnel. *(Don't forget to link them to the Staff accounts created above).*

| Doctor Name | Specialization | Shift 1 | Shift 2 |
| :--- | :--- | :--- | :--- |
| Dr. Maester Aemon | Cardiology | 09:00 - 13:00 | 14:00 - 18:00 |
| Dr. Qyburn | Neurology | 10:00 - 14:00 | 15:00 - 19:00 |
| Dr. Corlys Velaryon | Orthopedics | 08:00 - 12:00 | 13:00 - 17:00 |
| Dr. Rhaenyra Targaryen | Pediatrics | 09:30 - 13:30 | 14:30 - 18:30 |
| Dr. Alicent Hightower | Dermatology | 09:00 - 12:00 | 13:00 - 17:00 |
| Dr. Daemon Targaryen | Oncology | 10:00 - 14:00 | 15:00 - 18:00 |
| Dr. Ser Duncan the Tall | Psychiatry | 08:30 - 12:30 | 13:30 - 17:30 |
| Dr. Melisandre | Gastroenterology| 09:00 - 13:00 | *(No Shift 2)* |
| Dr. Otto Hightower | Endocrinology | 11:00 - 15:00 | 16:00 - 19:00 |
| Dr. Grand Maester Pycelle| Ophthalmology | 08:00 - 12:00 | 13:00 - 16:00 |
| Dr. Viserys Targaryen | Urology | 10:30 - 14:30 | 15:30 - 19:30 |
| Dr. Aegon the Conqueror | ENT | 09:00 - 13:00 | 14:00 - 18:00 |

---

## 5. Patient Registry (35 Patients)
Navigate to **Patients** (Log in as Receptionist: `frontdesk@citadel.com`).

| # | Patient Name | Age | | # | Patient Name | Age |
| - | :--- | :--- | :--- | - | :--- | :--- |
| 1 | Jon Snow | 24 | | 19| Petyr Baelish | 45 |
| 2 | Daenerys Targaryen | 22 | | 20| Varys | 50 |
| 3 | Tyrion Lannister | 39 | | 21| Jorah Mormont | 55 |
| 4 | Arya Stark | 18 | | 22| Barristan Selmy | 65 |
| 5 | Sansa Stark | 20 | | 23| Khal Drogo | 30 |
| 6 | Bran Stark | 16 | | 24| Aemond Targaryen | 20 |
| 7 | Jaime Lannister | 40 | | 25| Helaena Targaryen | 19 |
| 8 | Cersei Lannister | 40 | | 26| Rhaenys Targaryen | 55 |
| 9 | Joffrey Baratheon | 19 | | 27| Larys Strong | 35 |
| 10| Ned Stark | 45 | | 28| Harwin Strong | 35 |
| 11| Catelyn Stark | 42 | | 29| Criston Cole | 35 |
| 12| Robb Stark | 20 | | 30| Aegon "Egg" Targaryen | 10 |
| 13| Theon Greyjoy | 22 | | 31| Baelor Breakspear | 39 |
| 14| Margaery Tyrell | 21 | | 32| Maekar Targaryen | 45 |
| 15| Olenna Tyrell | 70 | | 33| Brynden "Bloodraven" | 50 |
| 16| Brienne of Tarth | 32 | | 34| Aerion Brightflame | 25 |
| 17| Sandor Clegane | 40 | | 35| Rohanne Webber | 25 |
| 18| Gregor Clegane | 45 | | | | |

---

## 6. Sample Appointments 
Book these as **Samwell Tarly** (Receptionist) to create a busy, realistic schedule for the demo.

| Patient | Doctor | Time | Recommended Status for Demo |
| :--- | :--- | :--- | :--- |
| Jon Snow | Dr. Maester Aemon (Cardiology) | Today, 10:00 | **Completed** |
| Tyrion Lannister | Dr. Qyburn (Neurology) | Today, 11:30 | **Completed** |
| Jaime Lannister | Dr. Corlys Velaryon (Orthopedics) | Today, 14:00 | **Checked-In** |
| Aegon "Egg" Targaryen | Dr. Rhaenyra Targaryen (Pediatrics) | Today, 14:30 | **Checked-In** |
| Jorah Mormont | Dr. Alicent Hightower (Dermatology) | Today, 15:00 | **Booked** |
| Daenerys Targaryen | Dr. Daemon Targaryen (Oncology) | Today, 15:30 | **Booked** |
| Cersei Lannister | Dr. Ser Duncan the Tall (Psychiatry) | Today, 16:00 | **Booked** |
| Ned Stark | Dr. Melisandre (Gastro) | Tomorrow, 09:00| **Booked** |
| Baelor Breakspear | Dr. Otto Hightower (Endo) | Tomorrow, 11:30| **Booked** |
| Arya Stark | Dr. Grand Maester Pycelle (Ophthalmology) | Tomorrow, 13:00| **Booked** |
| Theon Greyjoy | Dr. Viserys Targaryen (Urology) | Tomorrow, 14:30| **Booked** |
| Sandor Clegane | Dr. Aegon the Conqueror (ENT) | Tomorrow, 15:00| **Booked** |

### 💡 Recruiter Demo Workflow Tip:
1. Log in as **Receptionist (Samwell Tarly)**, show the massive patient registry and the busy global schedule.
2. Search for **Jorah Mormont** in the schedule and mark him as **Checked-In**.
3. Log out, and log back in as **Dr. Corlys Velaryon** (`cvelaryon@citadel.com`). 
4. Emphasize to the recruiter that Dr. Velaryon **cannot see** Jorah Mormont (Dermatology) or Aegon (Pediatrics) because of strict Role-Based Access Control. He only sees **Jaime Lannister** (Orthopedics).
5. Click **Complete** on Jaime Lannister's appointment and type in a simulated medical evaluation note.
