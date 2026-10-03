# Cyber Incident Response Planner: Interview Prep

## The project in one sentence

This is a browser-based tabletop demo that uses fictional cyber incident and network data to rank alerts, show which systems are connected, and compare possible routes through that modeled network. It helps people discuss response choices. It does not connect to or control a real company network.

## A simple way to explain how it works

1. The app loads a sample scenario containing alerts, systems, and links between systems.
2. It gives each alert a score based on severity, the affected system's importance, direct dependencies, and time against an example response deadline.
3. A max-heap puts the highest-scoring alert at the top of the queue.
4. Graph algorithms explore connected systems and dependencies.
5. Route algorithms compare paths using the link effort values entered in the fictional scenario.
6. The interface shows the calculations so a person can review them. The result is planning guidance, not an automatic response command.

## Interview questions and sample answers

### 1. What did you use for the frontend?

**Answer:** “The frontend uses React 19 and TypeScript, with Vite for the development server and build. The interface runs in the browser. We also use Tailwind CSS for styling and Three.js for some visual effects.”

**In simple terms:** React builds the screen from reusable parts. TypeScript helps catch mistakes in code. Vite runs the project during development and creates its browser-ready build.

### 2. What did you use for the backend?

**Answer:** “There is no separate backend in this version. The demo runs its algorithms in the browser and uses sample data. Some planner state is saved in the browser's local storage. We have not connected a server or database.”

**Remember:** This was submitted as a MERN hackathon project, but the current implementation is a client-side prototype. Do not say it uses Express or MongoDB unless you have actually added them.

### 3. What problem does the project solve?

**Answer:** “During a cyber incident, teams may have several alerts and connected systems to consider. This demo gives them a structured way to rank fictional alerts, inspect modeled system connections, and compare routes before discussing a response.”

### 4. Who is the intended user?

**Answer:** “It is intended for students, incident-response teams, or judges to explore tabletop scenarios and understand the reasoning behind possible priorities. It is not currently a production security operations tool.”

### 5. What algorithms did you use?

**Answer:** “The code includes a binary max-heap for alert priority, breadth-first search for reachability by hops, Dijkstra's algorithm and A* for route comparisons, Kahn's algorithm for dependency ordering, and depth-first search for cycle detection.”

**Short version:** “A heap ranks alerts. Graph searches explore connections. Shortest-path algorithms compare routes. Topological sorting orders dependencies.”

### 6. How does the alert priority score work?

**Answer:** “The score combines four inputs: CVSS severity times 3.5, system criticality times 3, the number of direct dependency links times 4, and elapsed SLA time as a 0-to-10 urgency value times 2. The app adds those weighted values and displays the breakdown.”

**Important detail:** The score is a prototype formula. It is not a validated security standard, and it is not guaranteed to stay between 0 and 100. The dependency count in the code is direct, even though some comments describe broader impact.

### 7. Why use a max-heap?

**Answer:** “A max-heap keeps the highest score at its root, so we can quickly inspect or remove the most urgent alert. Adding or removing an item takes logarithmic time, while checking the highest-priority item takes constant time.”

**In simple terms:** It is like a task pile that keeps the biggest priority on top without sorting every item after each change.

### 8. What is breadth-first search used for?

**Answer:** “BFS starts from a modeled affected system and visits connected systems one link at a time. It groups systems by hop distance, which helps visualize possible reachability in the scenario.”

**Caveat:** A modeled connection does not prove that an attacker reached that system. It only shows what is reachable in the supplied graph.

### 9. What does Dijkstra's algorithm do here?

**Answer:** “Dijkstra compares paths by adding the effort values assigned to their links. With non-negative link weights, it finds a minimum-total-weight path in the modeled graph.”

**Caveat:** The weights are estimates supplied by the scenario. They are not measured minutes unless the scenario explicitly defines them that way. The current code's implementation scans unvisited nodes to find the next one, so do not claim it uses a binary heap.

### 10. Why also include A*?

**Answer:** “A* uses the path cost so far plus a heuristic estimate of remaining distance to guide its search toward a target. The app lets us compare its route result with Dijkstra's result.”

**Caveat:** The heuristic depends on the nodes' visual coordinates. It should be validated against the edge weights before claiming it always preserves the optimal path. The current implementation uses sets and linear scans rather than a priority-queue heap.

### 11. What is Kahn's algorithm doing?

**Answer:** “Kahn's algorithm produces an ordering for a directed dependency graph. It repeatedly processes nodes with zero incoming dependencies. If it cannot process every node, the graph contains a cycle.”

**In simple terms:** It helps reveal a possible order for considering dependent systems. It does not safely shut systems down by itself.

### 12. Why use depth-first search?

**Answer:** “The DFS cycle detector follows dependency links and tracks the current path. If it reaches a node already on that path, it has found a cycle.”

### 13. What is a graph in this project?

**Answer:** “A graph is a data model made from nodes and edges. Here, a node represents a system and an edge represents a modeled connection or dependency. Algorithms can then examine routes and relationships.”

### 14. What happens when the user changes a scenario?

**Answer:** “The interface updates its browser state and recalculates the views from the selected systems, links, and alerts. The scenario editor can add a fictional alert and mark its target system as compromised in the demo.”

### 15. Does it use AI or machine learning?

**Answer:** “The core prioritization and route calculations are explicit algorithms, not a trained AI model. The project name and hackathon branch mention AI/ML, but this planner's core decisions come from the scoring formula and graph algorithms.”

### 16. Is the data stored in a database?

**Answer:** “The sample scenarios are in the frontend code. The response planner saves some state in browser local storage. There is no database server in this version, so that local data is tied to the browser and device.”

### 17. How do you know the recommendations are correct?

**Answer:** “The demo makes the rules visible, but the score weights and scenario estimates still need review with incident responders. We would validate expected outputs on small hand-checked scenarios before using the model for any real planning.”

### 18. What are the main limitations?

**Answer:** “It uses fictional or user-entered data, has no live threat feeds or backend, and does not verify real network topology. Its scores and route weights are illustrative. It must not make or execute real containment decisions.”

### 19. How would you improve it next?

**Answer:** “First, test the formulas and scenarios with security practitioners. Then I would improve input validation, add automated checks for algorithm edge cases, and consider a backend with access controls if the project needs shared scenarios or persistent data.”

### 20. What is the project's practical benefit?

**Answer:** “It makes the reasoning visible during a tabletop exercise. A team can see why one alert ranks above another and how different link costs change a route, then discuss whether those assumptions make sense.”

### 21. What does the route cost mean?

**Answer:** “It is a relative effort or disruption weight assigned to a modeled connection. The algorithm adds those weights to compare routes. It does not automatically represent real-world time, money, or service impact.”

### 22. Can it stop an attack automatically?

**Answer:** “No. It visualizes and compares possible plans. It does not connect to security tools or isolate real systems. A qualified human would need to verify the facts and make any real response decision.”

## 30-second introduction to memorize

“Our project is a browser-based cyber incident response tabletop planner. It takes fictional alerts and a modeled system graph, calculates transparent priority scores, and uses graph algorithms to show reachability, dependencies, and route options. We built the frontend with React, TypeScript, and Vite. This version has no backend or database and does not control real infrastructure. Our goal is to make response assumptions easier to inspect and discuss.”

## If you get stuck during questions

Use this pattern: **what the feature does → which input it uses → what the output means → one limitation**.

Example: “BFS explores links from the selected system. It uses the scenario's graph and returns systems grouped by hop count. That shows modeled reachability, not confirmed compromise.”

## Corrections to make in the current slides

- Name the frontend as React, TypeScript, and Vite. Clarify that there is no separate backend or database in this version.
- Include Kahn's topological sort, DFS cycle detection, and A* alongside the max-heap, BFS, and Dijkstra algorithms shown in the source code.
- Remove the claim that Dijkstra uses a binary heap. The current code uses a set and scans for the next minimum-distance node.
- Label route values as scenario effort or disruption weights. The demo's values are not verified response times.
- Label all priority scores as prototype scores. The formula is not calibrated or capped at 100.
- Say “modeled reachable systems” rather than implying BFS confirms attacker movement or compromise.
- Present benchmark percentages and disruption figures as illustrative code values unless the team can provide reproducible measurements and their test method.
