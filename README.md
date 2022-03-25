CryptoCurrency-Tracker using jQuery and Ajax (RESTful API).



1. Toggled Checkboxes' ID are saved and stored in localStorage.
This is done under the assumption that in the most probable case, if a user wanted to 
view live reports on a specific coin on day "X", then he will also want to track the same coin again on the day he returns to the site.

2. Additional coin information that is retrieved in the event of clicking on the 'Show More Info' button,
will be stored in a cache array. An imminent clean up of that information will begin right afterwards,
deleting the information after two minutes. Once two minutes have passed, pressing the same show more Info button again will retrieve new information from the API.

3. You may choose to display up to 5 different coins at once in the live reports graph.


Loading page untill data fetched successfully from the API

![image](https://user-images.githubusercontent.com/68593924/160139555-d22a5786-addc-4d9f-9082-fa2166faa8f0.png)

Main Page

![image](https://user-images.githubusercontent.com/68593924/160140281-a3e1cd82-547d-4a97-b0d6-d92afb6adb78.png)



Live Reports Graph

![image](https://user-images.githubusercontent.com/68593924/160140133-744e3423-6e6e-4472-bfe6-ae14f9f23799.png)


Errors handling - 

Attemping to display more than 5 coins in the live chart - 

![image](https://user-images.githubusercontent.com/68593924/160140643-df40eff7-cf86-4a18-b2f3-d6d6cbeb71ca.png)

Attemping to display coins that do not exist on the live chart coin's API - 

![image](https://user-images.githubusercontent.com/68593924/160140789-44efbac5-b608-41d2-ad5f-ef621b75db82.png)

