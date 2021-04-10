//Check css to better understand purpose
document.documentElement.style.setProperty('--rand-delay', Math.random() * -50 + "s");

//Creates a basic img for code
function createImg(src, alt) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    return img;
}

//Cancels the transitions allowing for code to set values
function preventTransition(element) {
    blockTransition(element);
    allowTransition(element);
}
function blockTransition(element) {
    element.classList.add("no-anim");
    //Forces the window to redraw
    element.offsetHeight;
}
function allowTransition(element) {
    element.classList.remove("no-anim");
}

//This is used to wrap elements in a div for animating
function wrapInDiv(element) {
    const container = document.createElement("div");
    //Useful for appear animations
    container.style.overflow = "hidden";
    container.style.width = "100%";
    //Replace the element
    element.parentElement.insertBefore(container, element);
    container.appendChild(element);
    return container;
}

//Splits lastText into lines based off of the built-in css wrapping
function splitText(textElement) {
    //Cache these values for later use
    const words = textElement.textContent.split(" "), wordsLength = words.length;
    //The line builder creates these lines by making a line one at a time, and if a line wraps, makes a new one
    const linesBuilder = new LinesBuilder(textElement, textElement.parentElement);
    //Add each word to the lines
    for (let i = 0; i < wordsLength; i++) { linesBuilder.append(words[i] + " ") };
    //This makes sure that the lines can finish and returns the elements made as a product
    return linesBuilder.finish();
}
function LinesBuilder(replaceElement, parentElement) {
    //This element will hold the new lines
    const lines = document.createElement("div"), ogWidth = replaceElement.offsetWidth;
    //This object works like a loop, changing its current line every iteration
    let currentLine = new Line(lines), baseHeight = null;
    this.append = function (str) {
        //Then add it to the line
        currentLine.append(str);
        //I put this here because baseHeight requires at least one line with one word
        if (!baseHeight) baseHeight = currentLine.height()
        else if (currentLine.height() > baseHeight) {
            //If the line is broken
            //Revert back to the state before it broke and tie loose ends
            currentLine.finish(true);
            //Use this new line for other words
            currentLine = new Line(lines, str);
        }
    };
    this.finish = function () {
        //Officially add to dom
        parentElement.replaceChild(lines, replaceElement);
        currentLine.finish();
        //Force width with fixed amount (because it changes for some reason)
        lines.style.width = ogWidth + "px";
        //Returns the lines for use in animation
        return lines.children;
    };
    //It is IMPERITAVE that the lines are added to the dom. While this is worse for performance, it must be done to ensure that we can get the offsetHeight
    parentElement.appendChild(lines);
}
function Line(lines, str) {
    //Create element and the span (I make a span because it is important for animating seperately for cool overflow hidden affects)
    const line = lines.appendChild(lineTemplate.cloneNode(true)),
        lineSpan = line.firstElementChild;
    //This holds the text last for reverting
    let lastText = "";

    //Line methods
    //Gets the current height
    this.height = () => { return line.clientHeight };
    //Adds text, caches old
    this.append = str => { lastText = lineSpan.textContent; return lineSpan.textContent = lastText + str };
    //Finishes up
    this.finish = revert => {
        //Revert to add line breaking support
        if (revert) lineSpan.textContent = lastText;
        //Remove temp styles
        line.style.display = null;
        line.style.visibility = null;
        line.style.width = null;
        line.style.position = null;
        //This "solidifies" the lines
        line.style.whiteSpace = "nowrap";
        line.style.overflow = "hidden";
    };
    //If there is starter text, apply it
    if (typeof str === "string") this.append(str);
}

//This is the basic line structure for cloning
const lineTemplate = document.createElement("div");
//These are temp styles to ensure that we minimize the impact of checking offset height
lineTemplate.style.display = "inline-block";
lineTemplate.style.visibility = "hidden";
lineTemplate.style.width = "100%";
lineTemplate.style.position = "absolute";
lineTemplate.appendChild(document.createElement("p"));

//Global screen query
const sizeQuery = window.matchMedia("(min-width: 50rem)");

//Creates an array made of the property of a previous array
function arrayFromProperty(array, property) {
    const newArray = [];
    for (let i = 0; i < array.length; i++) newArray.push(array[i][property]);
    return newArray;
}

//Converts rem to pixels with the font size of the document element
function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

//Retrieves a json file
function readJsonFile(file, callback, progressCallback) {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.overrideMimeType("application/json");
    xmlhttp.onreadystatechange = function () { if (this.readyState === 4 && this.status == "200") callback(JSON.parse(this.responseText)) };
    xmlhttp.onprogress = progressCallback;
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
}