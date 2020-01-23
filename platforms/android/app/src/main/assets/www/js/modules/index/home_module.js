"use strict"
var notifications_object
var unopened_notifications_counter = 0;
var user;
var user_notifications;
var nav;

Element.prototype.appendAfter = function (element) {
    element.parentNode.insertBefore(this, element.nextSibling);
}, false;

/*
 ******************************************************************************************************************
 ******************************************************************************************************************
 **************************************************DOM STARTS******************************************************
 ******************************************************************************************************************
 ******************************************************************************************************************
 */
//deviceready
//DOMContentLoaded
document.addEventListener("deviceready", async function () {
    user = new User();
    let home_component;
    let notifications_response;

    //Check to make sure that the users session has not expired
    await user.check_session();

    //Once we are sure that the users session is valid, we populate the User class
    user.setName(await get_secure_storage("user_name"));
    user.setEmail(await get_secure_storage("users_email"));
    user.setStatus(JSON.parse(await get_secure_storage("user_status")) ? "Tutor" : "Student");

    ////Set status of user to tutor
    //user.setName("Joe Postolachi")
    //user.setStatus("Student");
    //user.setEmail("D00192082@student.dkit.ie");

    //If a user is a tutor, then he has modules he can offer and thus he can view the forum
    //and he cannot apply to become a tutor again

    console.log(notifications_response);
    //Define our Navigation controller for the home tab
    nav = document.getElementById('nav-home');

    //Controler for enabling the back button for Ionic Router, needs to be updated with all new components added
    document.addEventListener("backbutton", async function () {
        let home_active_component = await nav.getActive();

        //Checking if the main home nav router is defined
        if (typeof nav !== 'undefined') {
            //Checking if the notifications nav router is defined
            if (typeof nav_notifications !== 'undefined') {
                //We check here if there is an open component
                let can_go_back_home = await nav.canGoBack();

                //If there is an active component and the active compoent matches our criteria, we go back
                if (can_go_back_home && home_active_component.component == "nav-all-tutorials") {
                    nav.pop();
                } else if (can_go_back_home && home_active_component.component == "nav-post-tutorial") {
                    nav.pop();
                }

                let notifications_active_component = await nav_notifications.getActive();
                console.log(notifications_active_component);

                let can_go_back_notifications = await nav_notifications.canGoBack();
                console.log(can_go_back_notifications)

                if (can_go_back_notifications && notifications_active_component.component == "nav-notification") {
                    nav_notifications.pop();
                }

                //If there is no active component in either the notifications router or home router, we exit the app
                if (!can_go_back_notifications && !can_go_back_home) {
                    navigator.app.exitApp();
                }
            } else {
                let can_go_back_home = await nav.canGoBack();

                if (can_go_back_home && home_active_component.component == "nav-all-tutorials") {
                    nav.pop();
                } else if (can_go_back_home && home_active_component.component == "nav-post-tutorial") {
                    nav.pop();
                } else {
                    navigator.app.exitApp();
                }
            }

        }
    }, false);

    //Create home component 
    customElements.define('nav-home', class Home extends HTMLElement {
        async connectedCallback() {
            if (user.getStatus() === "Tutor") {
                user.setModules(JSON.parse(await get_secure_storage("user_modules")));
                //user.setModules(["PHP", "JavaScript", "Java"]);
                home_component = `<ion-header translucent>
                            <ion-toolbar>
                                <ion-buttons slot="start">
                                    <ion-back-button></ion-back-button>
                                </ion-buttons>
                                <ion-buttons slot="end">
                                    <ion-menu-button></ion-menu-button>
                                </ion-buttons>
                                <ion-title>
                                    <h1>Service Loop</h1>
                                </ion-title>
                            </ion-toolbar>
                        </ion-header>

                        <ion-content fullscreen class="ion-padding back">
                            <!--<ion-content padding>
                                <ion-button expand="block" onclick="openMenu()">Open Menu</ion-button>
                            </ion-content>-->
                            <h2 class="user_name"><strong>Welcome <p style="margin-top:0px;" id="user_name">John</p> <p style="margin-top:0px;" id="user_status">Student</p></strong></h2>
                            <div class="white_backgound">
                                <br><br><br>
                                <!--<ion-button expand="block" >Post Offer</ion-button>
                                <ion-button expand="block" >Look For Offer</ion-button>
                                <ion-button expand="block" >My Posts</ion-button>
                                <ion-button expand="block" >Ongoing Exchanges</ion-button>-->

                                <ion-list class='home_buttons ion-activatable ripple' id="post_tutorial">
                                    <h6>Request a tutorial</h6>
                                    <p>Request our tutors for a tutorial for a particular module</p>
                                    <img class='b_circle' src="images/circle.png" alt=""/>
                                    <img class='i_post' src="images/i_post.png" alt=""/>
                                    <ion-ripple-effect></ion-ripple-effect>
                                </ion-list>

                                <hr><hr>
                                <ion-list class='home_buttons ion-activatable ripple' id="all_tutorials">
                                    <h6>All tutorial requests</h6>
                                    <p>View all the requested tutorials on the forum</p>
                                    <img class='b_circle' src="images/circle.png" alt=""/>
                                    <img class='i_search' src="images/i_search.png" alt=""/>
                                    <ion-ripple-effect></ion-ripple-effect>
                                </ion-list>
            
                                <hr><hr>
                                <ion-list class='home_buttons ion-activatable ripple'>
                                    <h6>My Posts</h6>
                                    <p>Some text about my post</p>
                                    <img class='b_circle' src="images/circle.png" alt=""/>
                                    <img class='i_post' src="images/i_posts.png" alt=""/>
                                    <ion-ripple-effect></ion-ripple-effect>
                                </ion-list>
                                <hr><hr>
                                <ion-list class='home_buttons ion-activatable ripple'>
                                    <h6>Ongoing Exchanges</h6>
                                    <p>Some text about ongoing exchanges</p>
                                    <img class='b_circle' src="images/circle.png" alt=""/>
                                    <img class='i_exchange' src="images/i_exchange.png" alt=""/>
                                    <ion-ripple-effect></ion-ripple-effect>
                                </ion-list> 
                                <!--<ion-item onclick="navigateForward()">
                                    Navigate Forward
                                </ion-item>-->


                            </div>
                        </ion-content>`;
                //We get all the users notifications based off his email and modules
                notifications_response = await access_route({users_email: user.getEmail(), user_tutor: {is_tutor: true, user_modules: user.getModules()}}, "get_all_notifications");
            } else {
                home_component = `<ion-header translucent>
                            <ion-toolbar>
                                <ion-buttons slot="start">
                                    <ion-back-button></ion-back-button>
                                </ion-buttons>
                                <ion-buttons slot="end">
                                    <ion-menu-button></ion-menu-button>
                                </ion-buttons>
                                <ion-title>
                                    <h1>Service Loop</h1>
                                </ion-title>
                            </ion-toolbar>
                        </ion-header>

                        <ion-content fullscreen class="ion-padding back">
                            <!--<ion-content padding>
                                <ion-button expand="block" onclick="openMenu()">Open Menu</ion-button>
                            </ion-content>-->
                            <h2 class="user_name"><strong>Welcome <p style="margin-top:0px;" id="user_name">John</p> <p style="margin-top:0px;" id="user_status">Student</p></strong></h2>
                            <div class="white_backgound">
                                <br><br><br>
                                <!--<ion-button expand="block" >Post Offer</ion-button>
                                <ion-button expand="block" >Look For Offer</ion-button>
                                <ion-button expand="block" >My Posts</ion-button>
                                <ion-button expand="block" >Ongoing Exchanges</ion-button>-->

                                <ion-list class='home_buttons ion-activatable ripple' id="post_tutorial">
                                    <h6>Request a tutorial</h6>
                                    <p>Request our tutors for a tutorial for a particular module</p>
                                    <img class='b_circle' src="images/circle.png" alt=""/>
                                    <img class='i_post' src="images/i_post.png" alt=""/>
                                    <ion-ripple-effect></ion-ripple-effect>
                                </ion-list>

                                <hr><hr>
                                <ion-list class='home_buttons ion-activatable ripple' id="home_tutor_application">
                                    <h6>Apply to be a tutor</h6>
                                    <p>Have you got what it takes to be a tutor? Apply today!</p>
                                    <img class='b_circle' src="images/circle.png" alt=""/>
                                    <img class='i_search' src="images/i_search.png" alt=""/>
                                    <ion-ripple-effect></ion-ripple-effect>
                                </ion-list>
            
                                <hr><hr>
                                <ion-list class='home_buttons ion-activatable ripple'>
                                    <h6>My Posts</h6>
                                    <p>Some text about my post</p>
                                    <img class='b_circle' src="images/circle.png" alt=""/>
                                    <img class='i_post' src="images/i_posts.png" alt=""/>
                                    <ion-ripple-effect></ion-ripple-effect>
                                </ion-list>
                                <hr><hr>
                                <ion-list class='home_buttons ion-activatable ripple'>
                                    <h6>Ongoing Exchanges</h6>
                                    <p>Some text about ongoing exchanges</p>
                                    <img class='b_circle' src="images/circle.png" alt=""/>
                                    <img class='i_exchange' src="images/i_exchange.png" alt=""/>
                                    <ion-ripple-effect></ion-ripple-effect>
                                </ion-list>
                                <!--<ion-item onclick="navigateForward()">
                                    Navigate Forward
                                </ion-item>-->


                            </div>
                        </ion-content>`;
                //We get all the users notificatios based only on his email as the user is not a tutor
                notifications_response = await access_route({users_email: user.getEmail(), user_tutor: {is_tutor: false, user_modules: user.getModules()}}, "get_all_notifications");
            }

            this.innerHTML = home_component;

            //Update the users UI depending on what the user is
            document.getElementById('user_name').innerText = user.getName();
            if (user.getStatus() === "Tutor") {
                document.getElementById('user_status').innerText = "Tutor";
            } else {
                document.getElementById('user_status').innerText = "Student";
            }

            //If the user is a tutor, we display the forum else we have a button to apply to become a tutor
            if (user.getStatus() === "Tutor") {
                include("js/modules/index/forum_module.js", "forum_script");
                let handler = () => {
                    //Remember to move this to new file
                    all_tutorials(nav);
                };
                document.getElementById('all_tutorials').addEventListener('click', handler);
            } else {
                include("js/modules/index/apply_to_be_tutor_module.js", "apply_to_be_tutor_script"); 
                //To later remove the event listener, we create a reference to the function and we pass the handler to that function so that we can later remove the event listener
                let handler = function () {
                    apply_to_be_tutor(handler);
                };
                document.getElementById("home_tutor_application").addEventListener('click', handler, false);
            }

            user.createWebSocketConnection();

            //Create a Notifications class to store all the details and functions relating to the notifications
            //Extends User class
            if (typeof notifications_response === "string") {
                user_notifications = new Notifications(notifications_response, user.getName(), user.getEmail(), user.getStatus(), user.getModules(), user.getSocket());
            } else {
                user_notifications = new Notifications(notifications_response.response, user.getName(), user.getEmail(), user.getStatus(), user.getModules(), user.getSocket());
            }
 
            //Now that we have notifications, we need to add a badge to show all unread notifications
            user_notifications.addUnreadNotificationsToDOM();
            user_notifications.waitForNewNotifications();

            //Create post tutorial page
            document.getElementById('post_tutorial').addEventListener('click', async function () {
                include("js/modules/index/request_tutorial_module.js", "request_tutorial_script");
                load_request_tutorial();
            });
        }

        //Callback to call when component is removed
        disconnectedCallback() {
            console.log('Custom square element removed from page.');
        }

        adoptedCallback() {
            console.log('Custom square element moved to new page.');
        }

        attributeChangedCallback(name, oldValue, newValue) {
//        switch (name) {
//            case 'value':
//                console.log(`Value changed from ${oldValue} to ${newValue}`);
//                break;
//            case 'max':
//                console.log(`You won't max-out any time soon, with ${newValue}!`);
//                break;
//        }
            console.log("Attribute changed?")
        }

    });

    //Lazy loading - once user clicks on tab, only then do we launch JavaScript
    document.querySelector("ion-tabs").addEventListener('ionTabsWillChange', function (event) {
        if (event.detail.tab === "notifications") {
            include("js/modules/index/notifications_module.js", "notifications_script");
        } else if (event.detail.tab === "settings") {
            include("js/modules/index/settings_module.js", "settings_script");
        }
    });
});