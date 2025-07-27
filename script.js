let windows = [];
let terminalCounter = 1;
let aboutCounter = 1;

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

class Window {
  constructor(container) {
    this.container = container;
    this.titleBar = container.querySelector(".title-bar");
    this.maximizeButton = container.querySelector(".maximize-button");
    this.isDragging = false;
    this.isResizing = false;
    this.dragOffset = { x: 0, y: 0 };
    this.resizeHandle = null;
    this.minWidth = 350;
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

    windows.forEach(manager => {
      if (manager.container !== this.container) {
        manager.container.classList.remove("active");
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
            content: "<placeholder>",
          },
          "projects.txt": {
            type: "file",
            content: "<placeholder>",
          },
          "contact.txt": {
            type: "file",
            content:
              "Get in touch:\nEmail: yatin [dot] lala [at] gmail [dot] com\nLinkedIn: linkedin.com/in/yatinlala\nGitHub: github.com/yatinlala",
          },
          "skills.txt": {
            type: "file",
            content: "<placeholder>",
          },
          "readme.txt": {
            type: "file",
            content:
              "Available commands:\n- ls: list files and directories\n- cat <filename>: display file contents\n- help: show available commands\n- clear: clear the terminal",
          },
        },
      },
    };

    const welcome = `Fakerosoft Fakedows 98 [Version 4.10.1998]\n(C) Copyright Fakerosoft Corp 1981-1998.\n\nType "help" for available commands.\n\n`;
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
    const cmd = parts[0];
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
    const helpText = `Available commands:\n\nls          - List files and directories\ncat         - Display file contents (usage: cat <filename>)\nhelp        - Show this help message\nclear       - Clear the terminal screen\npwd         - Show current directory path\n\nTry these files:\n- about.txt\n- projects.txt\n- contact.txt\n- skills.txt\n- readme.txt`;

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

function createNewTerminal(cssOverrides = {}, focus = true) {
  terminalCounter++;

  const terminalTemplate = document.getElementById("terminal-template");
  const newTerminalContainer = terminalTemplate.content.cloneNode(true);

  const defaultStyles = {
    position: "absolute",
    width: "600px",
    height: "500px",
    top: `${50 + terminalCounter * 30}px`,
    left: `${100 + terminalCounter * 30}px`,
  };

  const finalStyles = { ...defaultStyles, ...cssOverrides };

  const windowContainer = document.createElement("div");
  windowContainer.className = "window-container";
  Object.assign(windowContainer.style, finalStyles);
  windowContainer.appendChild(newTerminalContainer);

  document.body.appendChild(windowContainer);

  const windowManager = new Window(windowContainer);
  windows.push(windowManager);

  const outputElement = windowContainer.querySelector(".terminal-output");
  const inputElement = windowContainer.querySelector(".terminal-input");
  const newTerminal = new Terminal(outputElement, inputElement);

  if (focus) inputElement.focus();

  if (focus) windowManager.focusWindow();
}

function createNewAboutMe(cssOverrides = {}, focus = true) {
  aboutCounter++;

  const aboutMeTemplate = document.getElementById("about-me-template");
  const newAboutContainer = aboutMeTemplate.content.cloneNode(true);

  const defaultStyles = {
    position: "absolute",
    width: "350px",
    height: "410px",
    top: `${80 + aboutCounter * 25}px`,
    left: `${150 + aboutCounter * 25}px`,
  };

  const finalStyles = { ...defaultStyles, ...cssOverrides };

  const windowContainer = document.createElement("div");
  windowContainer.className = "window-container";
  Object.assign(windowContainer.style, finalStyles);
  windowContainer.appendChild(newAboutContainer);

  document.body.appendChild(windowContainer);

  const windowManager = new Window(windowContainer);
  windows.push(windowManager);

  if (focus) windowManager.focusWindow();
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

document.addEventListener("DOMContentLoaded", () => {
  createNewTerminal({ top: "30%", left: "50%" }, false);
  createNewAboutMe({ top: "20%", left: "10%" }, false);
  setupIconHandlers();
});

// }}}
