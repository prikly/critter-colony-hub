# CritterZone  Arena & Mini-games Hub

CritterZone is an interactive social arena designed for high-energy environments like hackathons and campus competitions, where waiting in long queues is common. The platform allows players to create customized creature profiles, gather in a shared community hub (“Arena”), react to one another, earn XP, and engage in real-time mini-games like Trivia and Word Chain.

Beyond entertainment, CritterZone is built to foster real-world connections. While waiting, users can explore who else is in the Arena, view profiles that include names, year/branch of study or designation, and a short conversation starter. This helps break the ice digitally, making it easier for participants to approach and interact in person. By combining quick, engaging gameplay with social discovery, CritterZone transforms idle waiting time into an opportunity to play, connect, and network seamlessly

---

##  Built With

### Frontend
- **React 19 & Vite** - Rapid, modern frontend building and serving.
- **TanStack Router** - Fully typesafe routing across the application.
- **Zustand** - Minimalistic and lightweight state management handling game states and UI modals.
- **Framer Motion** - Fluid micro-interactions and complex UI animations across Modals and Creature Cards.
- **Tailwind CSS v4 & generic UI primitives** - Responsive, glassmorphic UI design matching modern aesthetics.

### Backend
- **Convex** - The reactive backend platform scaling real-time game functions and player sync.
- **Convex Auth** - Seamless user authentication and token handling. 

---

##  Key Features

* **Creature Assignments**: Users are deterministically assigned a unique creature based on their credentials.
* **In-Depth Profiles**: Players can define their Display Name, College, Program, Tech Stack, Designation, and customized Ice-breaker line.
* **Dynamic Modals**: Interactively edit your profile or view other members' extended credentials without ever reloading or leaving the Arena.
* **The Arena**: A lobby populated with floating "Creature Cards" representing active players.
* **Live Reactions**: Send quick, animated emotes (👋, ⚡, 🎉, 🔥) directly to specific users.
* **Mini-Games**: Jump into rapid-fire Trivia or collaborative Word Chain games directly impacting the total accumulated XP on the Global Leaderboard.

---

##  Getting Started

To get the application running locally, ensure you have `npm` and `node` installed.

### 1. Installation
Clone the repository, then navigate to your project directory and install the dependencies.
```bash
git clone https://github.com/prikly/critter-colony-hub.git
cd critter-colony-hub
npm install
```

### 2. Run Convex Backend
In a separate terminal, deploy your Convex backend (run this during your development session to sync schemas and functions automatically).
```bash
npx convex dev
```

### 3. Run the Frontend Development Server
Start the Vite developer server.
```bash
npm run dev
```

Your app should now be running locally at `http://localhost:5173/` (or the default Vite port).

---

## 📁 Project Structure highlights

* `src/features/arena/` - Contains the crucial UI pieces for the Arena experience (e.g. `CreatureCard.tsx`, `EditProfileModal.tsx`, `ViewProfileModal.tsx`).
* `src/routes/` - Houses TanStack router pages handling core routes like `/` (Index), `/profile`, and `/arena`.
* `src/store/gameStore.ts` - Centralized application state logic bridging components.
* `convex/` - Represents your full backend logic including `schema.ts`, database queries (`users.ts`, `gameState.ts`), and periodic chron-jobs.

---

## Contributing

We welcome pull requests! For major changes, please open an issue first to discuss what you would like to change. 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

##  License
Distributed under the MIT License.
