const socket = io();

// elements
const $form = document.querySelector("#chatForm");
const $textinput = $form.querySelector("input");
const $formbutton = $form.querySelector("button");
const $locationbutton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// templates
const messageTemplate = document.querySelector("#message-template").innerHTML; // we want to access the html
const locationTemplate = document.querySelector("#location-template").innerHTML; // we want to access the html
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // get new message
  const $newMessage = $messages.lastElementChild;

  // height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // how far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight; // bottom of visible height

  if (containerHeight - newMessageHeight <= scrollOffset) {
    // checks if last message before new one was visible
    // if youre not at the bottom, your scrollOffset is less than the container's height
    // if you're at the bottom, it's around the same
    $messages.scrollTop = $messages.scrollHeight;
    // pushes to the bottom because the containers size is less than or equal to the scrollOffset
  }
};
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("location", (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  // when the form is submitted, disable the submit button until it is sent.
  $formbutton.setAttribute("disabled", "disabled");

  // send the message
  const message = e.target.elements.formMsg.value;
  socket.emit("sendMessage", message, (error) => {
    // once message is emitted, re-enable the button
    $formbutton.removeAttribute("disabled");
    // clear the input and focus it
    $textinput.value = "";
    $textinput.focus();
    if (error) return console.log(error);
    console.log("Delivered message: ", message);
  });
});

$locationbutton.addEventListener("click", (e) => {
  // disabling button until location sent
  $locationbutton.setAttribute("disabled", "disabled");

  e.preventDefault();
  if (!navigator.geolocation)
    return alert("geolocation not supported by your browser");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    socket.emit("sendLocation", { latitude, longitude }, () => {
      // location sent, so enabling button
      $locationbutton.removeAttribute("disabled");
      console.log("Location sent!");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});
