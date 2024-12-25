class Window {
  constructor(container) {
    this.container = container;
    this.titleBar = container.querySelector(".title-bar");
    this.maximizeButton = container.querySelector(".maximize-button");
    this.isDragging = false;
    this.isResizing = false;
    this.dragOffset = { x: 0, y: 0 };
    this.resizeHandle = null;
    this.minWidth = 400;
    this.minHeight = 300;
    this.savedState = null;

    this.initWindowControls();
  }

  initWindowControls() {
    this.container.addEventListener("mousedown", (e) => {
      this.focusWindow();
    });

    this.titleBar.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON") return;
      activeWindow = this;
      this.startDrag(e);
    });

    const resizeHandles = this.container.querySelectorAll(".resize-handle");
    resizeHandles.forEach((handle) => {
      handle.addEventListener("mousedown", (e) => {
        this.focusWindow();
        activeWindow = this;
        this.startResize(e, handle);
      });
    });

    this.titleBar.addEventListener("dblclick", () => {
      this.toggleMaximize();
    });

    this.maximizeButton.addEventListener("click", () => {
      this.toggleMaximize();
    });
  }

  startDrag(e) {
    this.focusWindow();
    this.isDragging = true;
    this.container.classList.add("dragging");

    const rect = this.container.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;

    e.preventDefault();
  }

  drag(e) {
    if (!this.isDragging) return;

    let newX = e.clientX - this.dragOffset.x;
    let newY = e.clientY - this.dragOffset.y;

    const windowWidth = this.container.offsetWidth;
    const windowHeight = this.container.offsetHeight;

    newX = Math.max(0, Math.min(newX, window.innerWidth - windowWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - windowHeight));

    this.container.style.left = newX + "px";
    this.container.style.top = newY + "px";
    this.container.style.transform = "none";
  }

  stopDrag() {
    this.isDragging = false;
    this.container.classList.remove("dragging");
  }

  startResize(e, handle) {
    this.isResizing = true;
    this.resizeHandle = handle;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = this.container.offsetWidth;
    this.startHeight = this.container.offsetHeight;
    this.startLeft = this.container.offsetLeft;
    this.startTop = this.container.offsetTop;

    e.preventDefault();
    e.stopPropagation();
  }

  resize(e) {
    if (!this.isResizing || !this.resizeHandle) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    let newLeft = this.startLeft;
    let newTop = this.startTop;

    const classes = this.resizeHandle.className;

    if (
      classes.includes("right") ||
      classes.includes("bottom-right") ||
      classes.includes("top-right")
    ) {
      newWidth = Math.max(this.minWidth, this.startWidth + deltaX);
    }
    if (
      classes.includes("left") ||
      classes.includes("bottom-left") ||
      classes.includes("top-left")
    ) {
      newWidth = Math.max(this.minWidth, this.startWidth - deltaX);
      newLeft = this.startLeft + (this.startWidth - newWidth);
    }
    if (
      classes.includes("bottom") ||
      classes.includes("bottom-left") ||
      classes.includes("bottom-right")
    ) {
      newHeight = Math.max(this.minHeight, this.startHeight + deltaY);
    }
    if (
      classes.includes("top") ||
      classes.includes("top-left") ||
      classes.includes("top-right")
    ) {
      newHeight = Math.max(this.minHeight, this.startHeight - deltaY);
      newTop = this.startTop + (this.startHeight - newHeight);
    }

    if (newLeft < 0) {
      newWidth += newLeft;
      newLeft = 0;
    }
    if (newTop < 0) {
      newHeight += newTop;
      newTop = 0;
    }
    if (newLeft + newWidth > window.innerWidth) {
      newWidth = window.innerWidth - newLeft;
    }
    if (newTop + newHeight > window.innerHeight) {
      newHeight = window.innerHeight - newTop;
    }

    this.container.style.width = newWidth + "px";
    this.container.style.height = newHeight + "px";
    this.container.style.left = newLeft + "px";
    this.container.style.top = newTop + "px";
  }

  stopResize() {
    this.isResizing = false;
    this.resizeHandle = null;
  }

  focusWindow() {
    highestZIndex++;
    this.container.style.setProperty("--window-z-index", highestZIndex);
    this.container.classList.add("active");

    windows.forEach((manager, container) => {
      if (container !== this.container) {
        container.classList.remove("active");
      }
    });
  }

  toggleMaximize() {
    if (this.container.classList.contains("maximized")) {
      this.container.classList.remove("maximized");
      this.container.style.width = this.savedState.width;
      this.container.style.height = this.savedState.height;
      this.container.style.left = this.savedState.left;
      this.container.style.top = this.savedState.top;
      this.container.style.transform = this.savedState.transform;
    } else {
      this.savedState = {
        width:
          this.container.style.width || getComputedStyle(this.container).width,
        height:
          this.container.style.height ||
          getComputedStyle(this.container).height,
        left:
          this.container.style.left || getComputedStyle(this.container).left,
        top: this.container.style.top || getComputedStyle(this.container).top,
        transform: this.container.style.transform,
      };

      this.container.classList.add("maximized");
      this.container.style.width = "100vw";
      this.container.style.height = "100vh";
      this.container.style.left = "0";
      this.container.style.top = "0";
      this.container.style.transform = "none";
    }
  }
}

class Terminal {
  constructor(outputElement, inputElement) {
    this.output = outputElement;
    this.input = inputElement;
    this.currentPath = "C:\\";

    this.filesystem = {
      "C:\\": {
        type: "directory",
        contents: {
          "about.txt": {
            type: "file",
            content:
              "Hi! I'm Yatin, a software developer.\nI love building things and solving problems.\nWelcome to my retro terminal website!",
          },
          "projects.txt": {
            type: "file",
            content:
              "My Projects:\n- Personal Website (this!)\n- Various web applications\n- Open source contributions\n- And more coming soon...",
          },
          "contact.txt": {
            type: "file",
            content:
              "Get in touch:\nEmail: hello@yatin.cc\nLinkedIn: linkedin.com/in/yatinlala\nGitHub: github.com/yatinlala",
          },
          "skills.txt": {
            type: "file",
            content:
              "Technical Skills:\n- JavaScript/TypeScript\n- Python\n- React/Node.js\n- Web Development\n- System Design\n- Problem Solving",
          },
          "readme.txt": {
            type: "file",
            content:
              'Welcome to my terminal!\n\nAvailable commands:\n- ls: list files and directories\n- cat <filename>: display file contents\n- help: show available commands\n- clear: clear the terminal\n\nTry "ls" to see what\'s here!',
          },
        },
      },
    };

    const welcome = `Fakerosoft Fakedows 98 [Version 4.10.1998]
(C) Copyright Fakerosoft Corp 1981-1998.

Type "help" for available commands.

`;
    this.output.innerHTML = welcome;

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const command = this.input.value.trim();
        if (command) {
          this.addToOutput(`${this.currentPath}>${command}`);
          this.executeCommand(command);
        } else {
          this.addToOutput(`${this.currentPath}>`);
        }
        this.input.value = "";
      }
    });
  }

  executeCommand(command) {
    const parts = command.split(" ");
    const cmd = parts[0]
    const args = parts.slice(1);

    switch (cmd) {
      case "ls":
        this.listFiles();
        break;
      case "cat":
        if (args.length === 0) {
          this.addToOutput("Usage: cat <filename>", "error");
        } else {
          this.catFile(args[0]);
        }
        break;
      case "help":
        this.showHelp();
        break;
      case "clear":
        this.clearTerminal();
        break;
      case "pwd":
        this.addToOutput(this.currentPath);
        break;
      default:
        this.addToOutput(
          `'${cmd}' is not recognized as an internal or external command.`,
          "error",
        );
    }
  }

  listFiles() {
    const current = this.filesystem[this.currentPath];
    if (!current || current.type !== "directory") {
      this.addToOutput("Directory not found", "error");
      return;
    }

    let output = `Directory of ${this.currentPath}\n\n`;

    for (const [name, item] of Object.entries(current.contents)) {
      const type = item.type === "directory" ? "<DIR>" : "     ";
      const displayName = item.type === "directory" ? name : name;
      const className = item.type === "directory" ? "directory" : "file";

      output += `${type}  ${displayName}\n`;
    }

    output += `\n${Object.keys(current.contents).length} item(s)`;
    this.addToOutput(output);
  }

  catFile(filename) {
    const current = this.filesystem[this.currentPath];
    if (!current || current.type !== "directory") {
      this.addToOutput("Directory not found", "error");
      return;
    }

    const file = current.contents[filename];
    if (!file) {
      this.addToOutput(`File '${filename}' not found`, "error");
      return;
    }

    if (file.type !== "file") {
      this.addToOutput(`'${filename}' is not a file`, "error");
      return;
    }

    this.addToOutput(file.content);
  }

  showHelp() {
    const helpText = `Available commands:

ls          - List files and directories
cat         - Display file contents (usage: cat <filename>)
help        - Show this help message
clear       - Clear the terminal screen
pwd         - Show current directory path

Try these files:
- about.txt
- projects.txt
- contact.txt
- skills.txt
- readme.txt`;

    this.addToOutput(helpText, "success");
  }

  clearTerminal() {
    this.output.innerHTML = "";
  }

  addToOutput(text, className = "") {
    const div = document.createElement("div");
    div.textContent = text;
    if (className) {
      div.className = className;
    }
    this.output.appendChild(div);
    const chatWindow = document.querySelector(".terminal-output");
    chatWindow.scrollTop = chatWindow.scrollHeight;
    this.input.focus();
  }
}

function createNewTerminal() {
  terminalCounter++;

  const outputId = `terminal-output-${terminalCounter}`;
  const inputId = `terminal-input-${terminalCounter}`;

  const newTerminalContainer = document.createElement("div");
  newTerminalContainer.className = "window-container";
  newTerminalContainer.style.cssText = `
    position: absolute;
    width: 600px;
    height: 500px;
    top: ${50 + terminalCounter * 30}px;
    left: ${100 + terminalCounter * 30}px;
  `;

  newTerminalContainer.innerHTML = createTerminalHTML(outputId, inputId);
  document.body.appendChild(newTerminalContainer);

  windows.set(newTerminalContainer, new Window(newTerminalContainer));

  const outputElement = document.getElementById(outputId);
  const inputElement = document.getElementById(inputId);
  const newTerminal = new Terminal(outputElement, inputElement);

  inputElement.focus();

  const windowManager = windows.get(newTerminalContainer);
  if (windowManager) {
    windowManager.focusWindow();
  }
}

function createNewAboutMe() {
  aboutCounter++;

  const newAboutContainer = document.createElement("div");
  newAboutContainer.className = "window-container";
  newAboutContainer.style.cssText = `
    position: absolute;
    width: 400px;
    height: 350px;
    top: ${80 + aboutCounter * 25}px;
    left: ${150 + aboutCounter * 25}px;
  `;

  newAboutContainer.innerHTML = createAboutMeHTML();
  document.body.appendChild(newAboutContainer);

  windows.set(newAboutContainer, new Window(newAboutContainer));

  const windowManager = windows.get(newAboutContainer);
  if (windowManager) {
    windowManager.focusWindow();
  }
}

function createTerminalHTML(outputId, inputId) {
  return `
    <div class="window">
      <div class="title-bar">
        <div class="title-bar-text">Terminal - yatin.cc</div>
        <div class="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button class="maximize-button" aria-label="Maximize"></button>
          <button aria-label="Close" onclick="this.closest('.window-container').remove()"></button>
        </div>
      </div>
      <div class="window-body terminal-body" style="height: calc(100% - 60px);">
        <div class="terminal-output" id="${outputId}"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">C:\\></span>
          <input
            type="text"
            class="terminal-input"
            id="${inputId}"
            autofocus
          />
        </div>
      </div>
      <!-- Resize Handles -->
      <div class="resize-handle edge top"></div>
      <div class="resize-handle edge bottom"></div>
      <div class="resize-handle edge left"></div>
      <div class="resize-handle edge right"></div>
      <div class="resize-handle corner top-left"></div>
      <div class="resize-handle corner top-right"></div>
      <div class="resize-handle corner bottom-left"></div>
      <div class="resize-handle corner bottom-right"></div>
    </div>
  `;
}

function createAboutMeHTML() {
  return `
    <div class="window">
      <div class="title-bar">
        <div class="title-bar-text">About Me - yatin.cc</div>
        <div class="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button class="maximize-button" aria-label="Maximize"></button>
          <button aria-label="Close" onclick="this.closest('.window-container').remove()"></button>
        </div>
      </div>
      <div class="window-body" style="height: calc(100% - 60px); padding: 15px; background: #c0c0c0; overflow-y: auto; font-family: 'MS Sans Serif', sans-serif; font-size: 11px;">
        <h3 style="margin: 0 0 10px 0; font-size: 12px;">Yatin Lala</h3>
      <!-- <p style="margin: 5px 0;"><strong>Software Developer</strong></p> -->
        <p style="margin: 10px 0 5px 0;">Hi! This is a work in progress site.</p>
        
     <!--    <h4 style="margin: 15px 0 5px 0; font-size: 11px;">Skills:</h4> -->
     <!--    <ul style="margin: 5px 0; padding-left: 20px;"> -->
      <!--     <li>JavaScript/TypeScript</li> -->
      <!--     <li>Python</li> -->
      <!--     <li>React/Node.js</li> -->
      <!--     <li>Web Development</li> -->
      <!--     <li>System Design</li> -->
      <!--   </ul> -->
        
        <h4 style="margin: 15px 0 5px 0; font-size: 11px;">Contact:</h4>
        <p style="margin: 5px 0;">Email: yatin [dot] lala [at] gmail [dot] com</p>
        <p style="margin: 5px 0;">GitHub: <a href="https://github.com/yatinlala">github.com/yatinlala</a></p>
        <p style="margin: 5px 0;">LinkedIn: <a href="https://linkedin.com/in/yatinlala">linkedin.com/in/yatinlala</a></p>
      </div>
      <!-- Resize Handles -->
      <div class="resize-handle edge top"></div>
      <div class="resize-handle edge bottom"></div>
      <div class="resize-handle edge left"></div>
      <div class="resize-handle edge right"></div>
      <div class="resize-handle corner top-left"></div>
      <div class="resize-handle corner top-right"></div>
      <div class="resize-handle corner bottom-left"></div>
      <div class="resize-handle corner bottom-right"></div>
    </div>
  `;
}

function setupIconHandlers() {
  const icons = document.querySelectorAll(".desktop-icon");

  icons.forEach((icon) => {
    let clickCount = 0;
    let clickTimer = null;

    icon.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;

      if (!icon.classList.contains("selected")) {
        if (!e.ctrlKey && !e.metaKey) {
          document
            .querySelectorAll(".desktop-icon")
            .forEach((i) => i.classList.remove("selected"));
          selectedIcons.clear();
        }
        icon.classList.add("selected");
        selectedIcons.add(icon);
      }

      isDraggingIcon = true;
      dragStartPos.x = e.clientX;
      dragStartPos.y = e.clientY;

      iconStartPositions.clear();
      if (selectedIcons.size > 0) {
        selectedIcons.forEach((selectedIcon) => {
          const rect = selectedIcon.getBoundingClientRect();
          iconStartPositions.set(selectedIcon, {
            x: rect.left,
            y: rect.top,
          });
        });
      } else {
        const rect = icon.getBoundingClientRect();
        iconStartPositions.set(icon, {
          x: rect.left,
          y: rect.top,
        });
      }

      e.preventDefault();
      e.stopPropagation();
    });

    icon.addEventListener("click", (e) => {
      if (isDraggingIcon) return;

      clickCount++;

      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 300);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;

        if (icon.id === "terminal-icon") {
          createNewTerminal();
        } else if (icon.id === "about-icon") {
          createNewAboutMe();
        }
      }

      e.stopPropagation();
    });
  });
}

function createSelectionRectangle() {
  if (!selectionRect) {
    selectionRect = document.createElement("div");
    selectionRect.className = "selection-rectangle";
    document.body.appendChild(selectionRect);
  }
  return selectionRect;
}

function updateSelectionRectangle(startX, startY, currentX, currentY) {
  const rect = createSelectionRectangle();
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  rect.style.left = left + "px";
  rect.style.top = top + "px";
  rect.style.width = width + "px";
  rect.style.height = height + "px";
  rect.style.display = "block";
}

function hideSelectionRectangle() {
  if (selectionRect) {
    selectionRect.style.display = "none";
  }
}

function isInsideRectangle(iconRect, selectionBounds) {
  return (
    iconRect.left < selectionBounds.right &&
    iconRect.right > selectionBounds.left &&
    iconRect.top < selectionBounds.bottom &&
    iconRect.bottom > selectionBounds.top
  );
}

function updateIconSelection(
  startX,
  startY,
  currentX,
  currentY,
  isCtrlHeld = false,
) {
  const selectionBounds = {
    left: Math.min(startX, currentX),
    top: Math.min(startY, currentY),
    right: Math.max(startX, currentX),
    bottom: Math.max(startY, currentY),
  };

  const icons = document.querySelectorAll(".desktop-icon");

  icons.forEach((icon) => {
    const iconRect = icon.getBoundingClientRect();
    const isInBounds = isInsideRectangle(iconRect, selectionBounds);

    if (isInBounds) {
      icon.classList.add("selected");
      selectedIcons.add(icon);
    } else if (!isCtrlHeld) {
      icon.classList.remove("selected");
      selectedIcons.delete(icon);
    }
  });
}

let terminalCounter = 1;
let aboutCounter = 1;

let windows = new Map();
let activeWindow = null;
let highestZIndex = 10;

let isSelecting = false;
let selectionStart = { x: 0, y: 0 };
let selectionRect = null;
let selectedIcons = new Set();
let isCtrlHeldDuringSelection = false;

let isDraggingIcon = false;
let dragStartPos = { x: 0, y: 0 };
let iconStartPositions = new Map();

const initialTerminalContainer = document.getElementById("initial-terminal");
initialTerminalContainer.innerHTML = createTerminalHTML(
  "terminal-output",
  "terminal-input",
);

windows.set(initialTerminalContainer, new Window(initialTerminalContainer));

const initialOutput = document.getElementById("terminal-output");
const initialInput = document.getElementById("terminal-input");
const terminal = new Terminal(initialOutput, initialInput);

const initialAboutContainer = document.getElementById("initial-about");
initialAboutContainer.innerHTML = createAboutMeHTML();
windows.set(initialAboutContainer, new Window(initialAboutContainer));

setupIconHandlers();

// {{{ Event Listeners
document.addEventListener("mousemove", (e) => {
  if (activeWindow) {
    if (activeWindow.isDragging) {
      activeWindow.drag(e);
    } else if (activeWindow.isResizing) {
      activeWindow.resize(e);
    }
  }

  if (isSelecting) {
    updateSelectionRectangle(
      selectionStart.x,
      selectionStart.y,
      e.clientX,
      e.clientY,
    );
    updateIconSelection(
      selectionStart.x,
      selectionStart.y,
      e.clientX,
      e.clientY,
      isCtrlHeldDuringSelection,
    );
  } else if (isDraggingIcon) {
    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = e.clientY - dragStartPos.y;

    iconStartPositions.forEach((startPos, icon) => {
      const newX = startPos.x + deltaX;
      const newY = startPos.y + deltaY;

      const constrainedX = Math.max(
        0,
        Math.min(newX, window.innerWidth - icon.offsetWidth),
      );
      const constrainedY = Math.max(
        0,
        Math.min(newY, window.innerHeight - icon.offsetHeight),
      );

      icon.style.left = constrainedX + "px";
      icon.style.top = constrainedY + "px";
    });
  }
});

document.addEventListener("mouseup", () => {
  if (activeWindow) {
    activeWindow.stopDrag();
    activeWindow.stopResize();
    activeWindow = null;
  }
  if (isSelecting) {
    isSelecting = false;
    hideSelectionRectangle();
  } else if (isDraggingIcon) {
    isDraggingIcon = false;
    iconStartPositions.clear();
  }
});

document.addEventListener("mousedown", (e) => {
  const isClickingIcon = e.target.closest(".desktop-icon");
  const isClickingWindow = e.target.closest(".window-container");

  if (!isClickingIcon && !isClickingWindow) {
    isSelecting = true;
    selectionStart.x = e.clientX;
    selectionStart.y = e.clientY;
    isCtrlHeldDuringSelection = e.ctrlKey || e.metaKey;

    if (!isCtrlHeldDuringSelection) {
      document.querySelectorAll(".desktop-icon").forEach((icon) => {
        icon.classList.remove("selected");
      });
      selectedIcons.clear();
    }

    e.preventDefault();
  }
});
// }}}
