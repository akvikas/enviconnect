const defaults = [
  { id: 1, title: "Restore the lake trail", category: "Clean-up", location: "Velachery Lake", date: "Sun, 7:30 AM", description: "A morning of trail cleanup, waste sorting, and local biodiversity mapping.", emoji: "🌊", members: 28, joined: false },
  { id: 2, title: "Balcony garden circle", category: "Growing", location: "Adyar", date: "Sat, 4:00 PM", description: "Swap seeds, learn soil basics, and start a small edible garden at home.", emoji: "🌿", members: 16, joined: false },
  { id: 3, title: "Plastic-smart campus", category: "Education", location: "Tambaram", date: "Wed, 3:30 PM", description: "A student-led workshop to identify and reduce single-use plastic on campus.", emoji: "♻️", members: 41, joined: false }
];
const key = "enviconnect-projects";
let projects = JSON.parse(localStorage.getItem(key) || "null") || defaults;
let filter = "all";
const grid = document.querySelector("#project-grid");
const template = document.querySelector("#project-template");
function save(){ localStorage.setItem(key, JSON.stringify(projects)); }
function render(){
  grid.replaceChildren();
  projects.filter(p => filter === "all" || p.category === filter).forEach(project => {
    const node = template.content.cloneNode(true);
    node.querySelector(".project-visual .emoji").textContent = project.emoji;
    node.querySelector(".category").textContent = project.category;
    node.querySelector(".meta").textContent = `${project.location} · ${project.date}`;
    node.querySelector("h3").textContent = project.title;
    node.querySelector(".description").textContent = project.description;
    const members = node.querySelector(".members");
    ["AR","VK","SL"].forEach(name => { const avatar=document.createElement("i"); avatar.textContent=name; members.append(avatar); });
    const join = node.querySelector(".join-button");
    join.textContent = project.joined ? "Joined ✓" : "Join →";
    join.classList.toggle("joined", project.joined);
    join.addEventListener("click", () => { project.joined = !project.joined; project.members += project.joined ? 1 : -1; save(); render(); });
    grid.append(node);
  });
  document.querySelector("#project-count").textContent = projects.length;
  document.querySelector("#people-count").textContent = projects.reduce((n,p) => n+p.members, 0);
  document.querySelector("#hours-count").textContent = projects.reduce((n,p) => n+p.members*2, 0);
}
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => { filter=button.dataset.filter; document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===button)); render(); }));
const dialog=document.querySelector("#project-dialog");
document.querySelector("#open-create").addEventListener("click",()=>dialog.showModal());
document.querySelector("#project-form").addEventListener("submit", event => { event.preventDefault(); const form=new FormData(event.currentTarget); projects.unshift({id:Date.now(),title:form.get("title"),category:form.get("category"),location:form.get("location"),date:form.get("date"),description:form.get("description"),emoji:"✦",members:1,joined:true}); save(); event.currentTarget.reset(); dialog.close(); filter="all"; document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter==="all")); render(); });
render();
