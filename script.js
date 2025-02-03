document.addEventListener("DOMContentLoaded", function() {
    const username = "NVPatel";
    const repoList = document.getElementById("repo-list");

    fetch(`https://api.github.com/users/${username}/repos?sort=created&per_page=10`)
        .then(response => response.json())
        .then(repos => {
            repoList.innerHTML = "";

            // Filter out GitHub Pages repositories
            const filteredRepos = repos.filter(repo =>
                !repo.name.includes(".github.io") &&
                (!repo.description || !repo.description.toLowerCase().includes("pages"))
            )//.slice(0, 4); // Take only 4 projects

            if (filteredRepos.length === 0) {
                repoList.innerHTML = "<li>No recent projects found.</li>";
                return;
            }

            filteredRepos.forEach(repo => {
                const listItem = document.createElement("li"); // Create project container
                listItem.classList.add("repo-box");

                // Default structure before loading README and languages
                listItem.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p class="repo-readme">Loading README...</p>
                    <div class="divider"></div> <!-- Divider between README and Language Stats -->
                    <div class="repo-languages">
                        <strong>Languages:</strong> <span class="loading-text">Loading...</span>
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="repo-button">
                        <img src="/static/icons/github.png" alt="GitHub" class="repo-icon"> Repo
                    </a>
                `;

                repoList.appendChild(listItem);

                // Fetch the README content
                fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
                    headers: { Accept: "application/vnd.github.v3.raw" }
                })
                .then(response => {
                    if (!response.ok) throw new Error("No README found");
                    return response.text();
                })
                .then(readme => {
                    const previewText = readme.split("\n").slice(0, 5).join(" "); // Get first 5 lines
                    listItem.querySelector(".repo-readme").textContent = previewText;
                })
                .catch(error => {
                    listItem.querySelector(".repo-readme").textContent = "";
                });

                // Fetch repository language statistics
                fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`)
                .then(response => response.json())
                .then(languages => {
                    const langContainer = listItem.querySelector(".repo-languages");
                    langContainer.innerHTML = "<strong>Languages:</strong> "; // Ensure "Languages:" is always present

                    if (Object.keys(languages).length === 0) {
                        langContainer.innerHTML += "No language data available.";
                        return;
                    }

                    let langStats = "";
                    const totalBytes = Object.values(languages).reduce((sum, val) => sum + val, 0);

                    for (const [lang, bytes] of Object.entries(languages)) {
                        const percentage = ((bytes / totalBytes) * 100).toFixed(1);
                        langStats += `<span class="lang-badge">${lang} (${percentage}%)</span> `;
                    }

                    langContainer.innerHTML += langStats;
                })
                .catch(error => {
                    listItem.querySelector(".repo-languages").innerHTML = "<strong>Languages:</strong> Data not available.";
                });
            });
        })
        .catch(error => {
            repoList.innerHTML = "<li>Error loading projects.</li>";
            console.error("Error fetching GitHub repositories:", error);
        });
});
