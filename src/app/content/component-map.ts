import { CodeBlock } from './code-block/CodeBlock.js';
import { Image } from './image/Image.js';
import { Clip } from './clip/Clip.js';
import { VideoEmbed } from './video-embed/VideoEmbed.js';
import { Diagram } from './diagram/Diagram.js';
import { Callout } from './callout/Callout.js';
import { Card } from './card/Card.js';
import { CardGrid } from './card/CardGrid.js';
import { Accordion } from './accordion/Accordion.js';
import { Accordions } from './accordion/Accordions.js';
import { Column } from './columns/Column.js';
import { Columns } from './columns/Columns.js';
import { ContentLink } from './link/ContentLink.js';
import { Heading } from './heading/Heading.js';
import { Button } from './landing/button/Button.js';

/**
 * The component map every `RenderableTreeNode` is rendered through.
 *
 * Defined once and shared because an API operation page renders prose from
 * two very different places — an authored narrative, and the description or
 * note attached to a single field — and both must behave exactly like guide
 * content. A `{% callout %}` inside a field description has to be a callout,
 * not a missing component; a link has to route through React Router rather
 * than reload the page.
 *
 * Keeping one map is what guarantees that. Two maps would drift the first
 * time a tag was added to only one of them, and the failure would be
 * invisible until an author happened to use that tag in the wrong place.
 */
export const contentComponents = {
  CodeBlock,
  Image,
  Clip,
  VideoEmbed,
  Callout,
  Card,
  CardGrid,
  Accordion,
  Accordions,
  Column,
  Columns,
  ContentLink,
  Heading,
  Button,
  Diagram,
};
