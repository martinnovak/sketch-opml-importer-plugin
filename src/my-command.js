import dialog from "@skpm/dialog";
import fs from "@skpm/fs";
import sketch from 'sketch'

const parseString = require('xml2js').parseString;

const ARTBOARD_WIDTH = 375;
const ARTBOARD_HEIGHT = 812;
const MARGIN_X = 20;
const MARGIN_Y = 50;

export default function () {
  let document = sketch.getSelectedDocument();

  const filepaths = dialog.showOpenDialogSync(document, {
    title: "Import mindmap as Artboards",
    buttonLabel: "Import",
    filters: [{name: "OPML", extensions: ["opml"]}],
    properties: ["openFile"] // , "multiSelections"]
  });

  if (filepaths.length !== 1) {
    return;
  }

  const fileContent = fs.readFileSync(filepaths[0], 'utf8');

  let page = document.selectedPage;
  page.layers = [];

  /**
   * Returns [x, y] of the right bottom corner.
   */
  function createArtboard(name, childNodes, x, y) {
    console.info('')
    let Artboard = sketch.Artboard;
    let myArtboard = new Artboard({
      parent: page,
      name: name,
      frame: {x: x, y: y, width: ARTBOARD_WIDTH, height: ARTBOARD_HEIGHT}
    });

    let res = 0;
    if (childNodes) {
      for (let i = 0; i < childNodes.length; ++i) {
        const child = childNodes[i];
        const xPos = x + ARTBOARD_WIDTH + MARGIN_X;
        const yPos = y + res * (ARTBOARD_HEIGHT + MARGIN_Y);
        const subRes = createArtboard(child['$']['text'], child['outline'], xPos, yPos);
        res += subRes;
      }
    }

    return Math.max(1, res);
  }

  parseString(fileContent, function (err, result) {
    const body = result['opml']['body'];
    const outline = body[0]['outline'][0];

    createArtboard(outline['$']['text'], outline['outline'], 0, 0);
  });
}
