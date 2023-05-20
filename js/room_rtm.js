const handleMemberJoined = async (MemberId) => {
  console.log("New Member Joined the Room", MemberId);
  addMemberToDom(MemberId);
  let members = await channel.getMembers();
  updateMemberTotal(members);
  let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);
  addBotMessageToDom(`Welcome to the Room ${name}! 👋`);
};

const addMemberToDom = async (MemberId) => {
  let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);
  let membersWrapper = document.getElementById(`member__list`);
  let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
  <span class="green__icon"></span>
  <p class="member_name">${name}</p>
</div>`;
  membersWrapper.insertAdjacentHTML("beforeend", memberItem);
};

const updateMemberTotal = async (members) => {
  document.getElementById("members__count").innerText = members.length;
};

const handleMemberLeft = async (MemberId) => {
  removeMemberFromDom(MemberId);
  let members = await channel.getMembers();
  updateMemberTotal(members);
};

const removeMemberFromDom = async (MemberId) => {
  let membersWrapper = document.getElementById(`member__${MemberId}__wrapper`);
  const name =
    membersWrapper.getElementsByClassName("member_name")[0].textContent;
  membersWrapper.remove();

  addBotMessageToDom(`${name} has left the chat! 👋`);
};

const getMembers = async () => {
  let members = await channel.getMembers();
  updateMemberTotal(members);
  for (let mem of members) {
    addMemberToDom(mem);
  }
};

const handleChannelMessage = async (messageData, MemberId) => {
  console.log("New Message Recieved");
  let data = JSON.parse(messageData.text);

  if (data.type === "chat") {
    addMessageToDom(data.displayName, data.message);
  }

  if (data.type == "user_left") {
    document.getElementById(`user-container-${data.uid}`);
    if (userIDInDisplayFrame === `user-container-${uid}`) {
      displayFrame.style.display = null;
      for (let i = 0; i < videoFrames.length; i++) {
        videoFrames[i].style.height = "300px";
        videoFrames[i].style.width = "300px";
      }
    }
  }
};

const sendMessage = async (e) => {
  e.preventDefault();
  let message = e.target.message.value;
  channel.sendMessage({
    text: JSON.stringify({
      type: "chat",
      message: message,
      displayName: displayName,
    }),
  });
  addMessageToDom(displayName, message);
  e.target.reset();
};

const addMessageToDom = async (name, message) => {
  const messagesWrapper = document.getElementById("messages");
  const newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                      </div>`;
  messagesWrapper.insertAdjacentHTML("beforeend", newMessage);
  let lastMessage = document.querySelector(
    "#messages .message__wrapper:last-child"
  );
  if (lastMessage) lastMessage.scrollIntoView();
};

const addBotMessageToDom = async (message) => {
  const messagesWrapper = document.getElementById("messages");
  const newMessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 Mumble Bot</strong>
                            <p class="message__text__bot">${message}</p>
                        </div>
                        </div>`;
  messagesWrapper.insertAdjacentHTML("beforeend", newMessage);
  let lastMessage = document.querySelector(
    "#messages .message__wrapper:last-child"
  );
  if (lastMessage) lastMessage.scrollIntoView();
};

const leaveChannel = async () => {
  await channel.leave();
  await rtmClient.logout();
};

window.addEventListener("beforeunload", leaveChannel);
let messageForm = document.getElementById("message__form");
messageForm.addEventListener("submit", sendMessage);
