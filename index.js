const crtGrid = document.getElementById("crt-grid");

// function fileClick() {
//   console.log("file click!");
//   const fooElements = document.querySelectorAll(".file");
//   console.log(fooElements);
//   fooElements.forEach((element) => {
//     console.log("eventListener!");
//     element.addEventListener("click", (e) => {
//       console.log("click!");
//     });
//   });
// }

const setupCRTGrid = () => {
  // rows and cols should be updated on every window resize
  var rows = Math.floor(window.innerHeight / 20);
  var cols = Math.floor(window.innerWidth / 20);

  // crtGrid.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
  // crtGrid.style.gridTemplateRows = `repeat(${rows}, 20px)`;

  crtGrid.textContent = "";

  function createSpan(char, classname) {
    if (char == null || char.length < 1) {
      console.log("Invalid param passed to createSpan");
    }
    while (char.length > 0) {
      const span = document.createElement("span");
      span.textContent = char.substring(0, 1);
      if (classname != null) {
        span.className = classname;
      }
      crtGrid.appendChild(span);
      char = char.substring(1);
    }
  }
  const file = "^File";
  createSpan(file, "menubar file");
  const edit = "^Edit";
  createSpan(edit, "menubar edit");
  const view = "^View";
  createSpan(view, "menubar view");
  const menubarTextLength = file.length + edit.length + view.length;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Compensate for menubarText creating spans
      if (x == 0 && y == 0) {
        x = menubarTextLength - 1;
      } else if (x == cols - 1 && y == rows - 1) createSpan("G", "bottom");
      else {
        const span = document.createElement("span");
        span.textContent = "•";
        crtGrid.appendChild(span);
      }
    }
  }
  const bottom = document.querySelector(".bottom");
  console.log(bottom);
  bottom.addEventListener("click", (event) => {
    console.log("clicked!");
  });
  // crtGrid.addEventListener("click", (e) => {
  //   if (e.target.classList.contains("bottom")) {
  //     console.log("click!");
  //   }
  // });
};

const randomBlink = () => {
  const spans = crtGrid.querySelectorAll("span");
  spans.forEach((span) => {
    if (Math.random() < 0.003) {
      const oldContent = span.textContent;
      span.textContent = "*";
      setTimeout(() => {
        span.textContent = oldContent;
      }, 100);
    }
  });
};

const toggleSubmenu = () => {
  const submenu = document.getElementById("fileMenu");
  submenu.style.display = submenu.style.display === "block" ? "none" : "block";
};

const snapToGrid = (value, gridSize) => Math.round(value / gridSize) * gridSize;

const spawnWindow = (type) => {
  const window = document.createElement("div");
  window.classList.add("window");
  window.style.top = `${snapToGrid(Math.random() * 50 + 50, 20)}px`;
  window.style.left = `${snapToGrid(Math.random() * 50 + 50, 20)}px`;
  window.style.width = "300px";
  window.style.height = "200px";

  const toolbar = document.createElement("div");
  toolbar.classList.add("toolbar");

  const title = document.createElement("span");
  title.textContent = type === "text" ? "Text Window" : "Image Window";

  const closeButton = document.createElement("button");
  closeButton.classList.add("close-btn");
  closeButton.textContent = "X";
  closeButton.onclick = () => window.remove();

  toolbar.appendChild(title);
  toolbar.appendChild(closeButton);
  window.appendChild(toolbar);

  const content = document.createElement("div");
  content.classList.add("content");

  if (type === "text") {
    content.textContent =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  } else {
    const img = document.createElement("img");
    img.src = "tree.png";
    img.alt = "Placeholder Image";
    img.style.width = "100%";
    img.style.height = "100%";
    content.appendChild(img);
  }

  window.appendChild(content);
  document.body.appendChild(window);

  makeDraggable(window);
};

const makeDraggable = (window) => {
  const toolbar = window.querySelector(".toolbar");
  let isDragging = false;
  let offsetX, offsetY;

  toolbar.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - window.offsetLeft;
    offsetY = e.clientY - window.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const snappedLeft = snapToGrid(e.clientX - offsetX, 20);
      const snappedTop = snapToGrid(e.clientY - offsetY, 20);
      window.style.left = `${snappedLeft}px`;
      window.style.top = `${snappedTop}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
};

window.addEventListener("resize", setupCRTGrid);
setupCRTGrid();

setInterval(randomBlink, 200);

const scanlineEffect = () => {
  const spans = crtGrid.querySelectorAll("span");
  let currentRow = 0;

  var rows = Math.floor(window.innerHeight / 20);
  var cols = Math.floor(window.innerWidth / 20);

  setInterval(() => {
    //     for (let i = 0; i < spans.length; i++) {
    spans.forEach((span, i) => {
      //       spans[i].textContent = row === currentRow ? "-" : "•";
      const row = Math.floor(i / cols);
      if (row === currentRow) {
        span.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      } else {
        span.style.backgroundColor = "transparent";
      }
    });

    currentRow = (currentRow + 1) % rows;
  }, 100);
};

scanlineEffect();

// Initialize with one text window and one image window
// spawnWindow("text");
// spawnWindow("image");
