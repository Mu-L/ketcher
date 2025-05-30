import { BaseSequenceItemRenderer, SequenceRenderer } from 'application/render';
import { D3SvgElementSelection } from 'application/render/types';
import { CoreEditor } from 'application/editor';
import ZoomTool from '../../../../editor/tools/Zoom';
import { select } from 'd3';
import { drawnStructuresSelector } from 'application/editor/constants';

const TEXT_COLOR = '#333333';
const HOVER_COLOR = '#167782';
const BUTTON_OFFSET_FROM_CANVAS = 20;
const BUTTON_Y_OFFSET_FROM_SENSE_ROW = 12;
const BUTTON_Y_OFFSET_FROM_ANTISENSE_ROW = 30;
const RECT_MAX_WIDTH = 620;

export class NewSequenceButton {
  private buttonElement?: D3SvgElementSelection<SVGElement, void>;
  private canvas: D3SvgElementSelection<SVGSVGElement, void>;
  private rootElement?: D3SvgElementSelection<SVGGElement, void>;
  private bodyElement?: D3SvgElementSelection<SVGForeignObjectElement, void>;

  constructor(private indexOfRowBefore: number) {
    this.canvas = ZoomTool.instance?.canvas || select(drawnStructuresSelector);
  }

  public show() {
    const editor = CoreEditor.provideEditorInstance();
    const chain =
      SequenceRenderer.sequenceViewModel.chains[this.indexOfRowBefore];
    const lastNodeRendererInChain =
      chain.lastNode?.antisenseNode?.renderer ||
      chain.lastNode?.senseNode?.renderer;

    if (!(lastNodeRendererInChain instanceof BaseSequenceItemRenderer)) {
      return;
    }

    this.rootElement = this.canvas
      .append('g')
      .data([this])
      .attr('class', 'dynamic-element')
      .attr(
        'transform',
        `translate(${BUTTON_OFFSET_FROM_CANVAS}, ${
          lastNodeRendererInChain.scaledMonomerPositionForSequence.y +
          (chain.hasAntisense
            ? BUTTON_Y_OFFSET_FROM_ANTISENSE_ROW
            : BUTTON_Y_OFFSET_FROM_SENSE_ROW)
        })`,
      )
      .attr('cursor', 'pointer') as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;

    this.rootElement.attr('opacity', '0');
    this.rootElement
      .append('rect')
      .attr('x', '16')
      .attr('y', '22')
      .attr('width', '0')
      .attr('height', '4')
      .attr('stroke', '#B4B9D6')
      .attr('stroke-width', '1')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');

    this.bodyElement = this.rootElement
      .append('foreignObject')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', '48')
      .attr('width', '48')
      .attr('data-testid', 'NewSequencePlusButton');

    this.buttonElement = this.bodyElement
      .append<SVGElement>('xhtml:div')
      .attr('data-testid', 'NewSequencePlusButtonIcon')
      .attr(
        'style',
        `
        width: 32px;
        margin: 8px;
        padding:  8px;
        font-size: 12px;
        color: ${TEXT_COLOR};
        border-radius: 20px;
        box-shadow: 0px 2px 5px 0px #67688426;
        background-color: #ffffff;
        font-weight: 400;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
      `,
      );

    NewSequenceButton.appendPlusIcon(this.buttonElement);

    this.rootElement
      .on('mouseover', () => {
        this.appendHover();
        this.rootElement?.attr('opacity', '1');
      })
      .on('mouseout', () => {
        this.removeHover();
        this.rootElement?.attr('opacity', '0');
      })
      .on('click', (event: MouseEvent) => {
        event.stopPropagation();
        editor.events.startNewSequence.dispatch({
          indexOfRowBefore: this.indexOfRowBefore,
        });
      });
  }

  public static appendPlusIcon(
    element: D3SvgElementSelection<SVGElement, void>,
  ) {
    element
      .append('svg')
      .attr('width', '16')
      .attr('height', '16')
      .attr('fill', 'currentColor')
      .append('path')
      .attr(
        'd',
        'M16 7.00095V9.00095H9V16.002H7V9.00095H0V7.00095H7V0.00195312H9V7.00095H16Z',
      );
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    this.buttonElement?.style('color', HOVER_COLOR);
  }

  protected appendHoverAreaElement(): void {}

  drawSelection(): void {}

  moveSelection(): void {}

  protected removeHover(): void {
    this.buttonElement?.style('color', TEXT_COLOR);
  }

  public remove() {
    this.rootElement?.remove();
    this.rootElement = undefined;
  }

  public setWidth(width: number): void {
    const rectElement = this.rootElement?.select('rect');
    const computedWidthPx = Math.min(
      (width - 1) * 20 + (width / 10) * 10,
      RECT_MAX_WIDTH,
    );
    rectElement?.attr('width', computedWidthPx);
  }
}
