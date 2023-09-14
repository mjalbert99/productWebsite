document.addEventListener("DOMContentLoaded", function (event){
        const template = document.querySelector('#table-row-template');
        const templateContent = template.content;
        const templateComment = document.querySelector('#comment_template');
        const commentContent = templateComment.content;
        const table = document.querySelector('table');
        const tbody = table.querySelector('tbody');
        const commentBody = document.querySelector('.comment_div');
        const submitComment = document.querySelector(".new_com_button");
        let score_data = [];
        let teams_Data = [];
        let prev_team_id = null;
        let current_team_id = null;

            // Get Sections from SlideSpace
            fetch("https://slidespace.icu/api/sections", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },

            })
                .then(response => response.json())
                .then(data => {
                    // console.log(data)
                    getTeam(data);
                })
                .catch(error => {
                    console.error(error);
                });

            // Gets Teams Data from SlideSpace
            async function getTeam(data) {
                // Get Team
                let temp = []
                data = JSON.parse(data.sections);
                const promises = Object.keys(data).map((section_id) => {
                    return fetch(`https://slidespace.icu/api/sections/${section_id}/teams`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            temp.push(data);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
                await Promise.all(promises);
                const result = {};
                temp.forEach(d => {
                    const dict = JSON.parse(d.names);
                    Object.keys(dict).forEach(key => {
                        result[key] = dict[key];
                    });
                });
                getTeamData(result);
            }

            // Gets Specific Team Data from SlideSpace
            async function getTeamData(data) {
                let temp = [];
                let promises = [];
                const dataX = data;

                // Populates data for all teams
                Object.keys(dataX).forEach((team_id) => {
                    const promise = fetch(`https://slidespace.icu/api/teams/${team_id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            temp.push(data);
                        })
                        .catch((error) => {
                            console.error(error);
                        });

                    promises.push(promise);
                });
                await Promise.all(promises);
                const result = {};
                temp.forEach((d, i) => {
                    const name = Object.values(dataX)[i];
                    result[name] = d;
                });
                teams_Data = result;
                getTeamScore(result);
            }

            // Get Team Score from SlideSpace
            async function getTeamScore(data) {
                let temp = [];
                let promises = [];
                const dataX = data;

                // Populates data for each team score
                Object.keys(dataX).forEach((key) => {
                    const team = JSON.parse(dataX[key].team);
                    const id = team.id;

                    const promise = fetch(`https://slidespace.icu/api/teams/${id}/scores`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            temp.push(data);
                        })
                        .catch((error) => {
                            console.error(error);
                        });

                    promises.push(promise);
                });
                await Promise.all(promises);
                const result = {};

                // Parses data
                Object.keys(dataX).forEach((key, i) => {
                    const team = JSON.parse(dataX[key].team);
                    const name = team.name;
                    result[name] = temp[i];
                });

                score_data = result;

                // Takes the 3 scores and combines them into one
                for (let key in score_data) {
                  let scores = JSON.parse(score_data[key].scores);
                  let scoreValues = Object.values(scores);
                  let totalScore = scoreValues.reduce((total, score) => total + parseInt(score), 0);
                  score_data[key].totalScore = totalScore;
                }


                //Combines the sets into one for sorting
                const finalSet= {};
                for (const key in teams_Data) {
                  finalSet[key] = { ...teams_Data[key], ...score_data[key] };
                }


                // Sorts the set based on total score
                const sortedTeams = Object.values(finalSet).sort((a, b) => {
                  const aId = JSON.parse(a.scores).totalScore;
                  const bId = JSON.parse(b.scores).totalScore;
                  return aId - bId;
                });

                console.log(sortedTeams);

                // Places new table element
                for (const key in sortedTeams) {
                  const teamData = sortedTeams[key].team;
                  const parsedTeamData = JSON.parse(teamData.replace(/\n/g, "").replace(/\t/g, ""));
                  const members = JSON.parse(parsedTeamData.members);
                  const id = parsedTeamData.id;
                  const name = parsedTeamData.name;
                  const score = sortedTeams[key].totalScore;

                  // Creates template
                  const tr = templateContent.cloneNode(true);
                  tr.querySelector('.id').textContent = id;
                  tr.querySelector('.project-name').textContent = name;
                  tr.querySelector('.team-members').textContent = members.join(', ');
                  tr.querySelector('.score').textContent = score;

                  // On click listener
                    tr.querySelector('#table-row').addEventListener('click', function() {
                        const ID = this.querySelector('.id').textContent;
                        current_team_id = ID;

                        // Updates chosen idea to a different color backgorund
                        const tableRows = document.querySelectorAll('.idea_table tbody tr');
                        let prevRow;
                        for (let i = 0; i < tableRows.length; i++) {
                            const teamID = tableRows[i].querySelector('.id').textContent;
                            if (teamID === prev_team_id) {
                                prevRow = tableRows[i];
                                break;
                            }
                        }
                        if (prevRow) {
                            prevRow.style.backgroundColor = 'aliceblue';
                        }
                        this.style.backgroundColor = 'cornflowerblue';
                        prev_team_id = ID;

                        commentBody.innerHTML = '';
                        update_comments(ID);
                    });

                  // Appends to grid
                  tbody.appendChild(tr);
                }
            }



            // Loads comments into grid
            function update_comments(c_id) {
                    let user_id = null

                // Fetch request to get user id
                get_user().then(data=>{
                    user_id= data
                    const jData = {
                        id: c_id
                    }

                    // Gets comments from database
                fetch("/getComments", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(jData)
                })
                .then(response => response.json())
                .then(data => {

                    // Makes templates for all comments
                    for(let i = 0; i < data.length; i++){
                        const tc = commentContent.cloneNode(true);
                        tc.querySelector("#comment").textContent = `${data[i][3]}: ${data[i][4]}`;
                        const fav = tc.querySelector(".favicon");
                        const fav_edit = tc.querySelector(".favicon_edit");

                        // If the delete button is visible
                        if(data[i][2] != user_id){
                            fav.style.visibility = "hidden";
                            fav_edit.style.visibility = "hidden";
                        }

                        commentBody.appendChild(tc);

    fav_edit.addEventListener("click", function(event){
        event.preventDefault();
        console.log(data[i][0]) // Comment id in SQL table
        alert("hi")
    });



                        // Appends the comment to the grid

                        //Delete listener
                        fav.addEventListener("click", function (event){
                           event.preventDefault();
                           const jdata = {
                               id: data[i][0]
                           }

                           // Removes from data base
                            fetch("/deletecomment", {
                                              method: "POST",
                                              headers: {
                                                "Content-Type": "application/json"
                                              },
                                              body: JSON.stringify(jdata)
                                            })
                                            .then(response => response.json())
                                            .then(data => {
                                                //remove from grid
                                                 commentBody.removeChild(event.target.parentElement);
                                            })
                                            .catch(error => {
                                              console.error(error);
                                            });
                        });
                    }
                })
                .catch(error => {
                  console.error(error);
                });

                });

            }

            // Gets user_id
            function get_user(){
                const id = sessionStorage.getItem("session_id");

                const jData = {
                    id: id
                }

                // Gets user_id from specific session
                return fetch("/getUserID", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(jData)
                })
                .then(response => response.json())
                .then(data => {
                    return data[0];
                })
                .catch(error => {
                  console.error(error);
                });
            }

            // Submit new comment
        submitComment.addEventListener("click", function (event){
          event.preventDefault();
          let user_id = null;
          let user = null;
          const newComment = document.querySelector(".new_comment").value;
          if(current_team_id == null){
              alert("Select a idea first");
              return;
          }
          if(newComment.length == 0){
              alert("Enter a comment first");
              return;
          }

          // Get user_id to add to comment
                  get_user().then(data=> {
                      user_id = data

                      let userData = {
                          id: user_id
                      }

                      // Gets user_id from specific session
                      fetch("/getUser", {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json"
                          },
                          body: JSON.stringify(userData)
                      })
                      .then(response => response.json())
                      .then(data => {
                          user = data[0];

                          let jData = {
                              team_id: current_team_id,
                              user_id: user_id,
                              user: user,
                              comment: newComment
                          }

                          fetch("/addComment", {
                              method: "POST",
                              headers: {
                                  "Content-Type": "application/json"
                              },
                              body: JSON.stringify(jData)
                          })
                          .then(response => response.json())
                          .then((data) => {
                                const tc = commentContent.cloneNode(true);
                                tc.querySelector("#comment").textContent = `${jData["user"]}: ${jData["comment"]}`;
                                const fav = tc.querySelector(".favicon");
                                commentBody.appendChild(tc);

                                 fav.addEventListener("click", function (event){
                                   event.preventDefault();
                                   const jdata = {
                                       id: data
                                   }

                                   // Removes from data base
                                    fetch("/deletecomment", {
                                                      method: "POST",
                                                      headers: {
                                                        "Content-Type": "application/json"
                                                      },
                                                      body: JSON.stringify(jdata)
                                                    })
                                                    .then(response => response.json())
                                                    .then(() => {
                                                        //remove from grid
                                                         commentBody.removeChild(event.target.parentElement);
                                                    })
                                                    .catch(error => {
                                                      console.error(error);
                                                    });
                                });


                          })
                          .catch(error => {
                              console.error(error);
                          });
                      })
                      .catch(error => {
                          console.error(error);
                      });
                  });
                });
});