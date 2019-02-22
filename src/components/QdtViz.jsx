import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
// import Preloader from '../utilities/Preloader';
import QdtButton from './QdtButton';

export default class QdtViz extends React.Component {
  static propTypes = {
    qAppPromise: PropTypes.object.isRequired,
    id: PropTypes.string,
    type: PropTypes.oneOf([null, 'barchart', 'boxplot', 'combochart', 'distributionplot', 'gauge', 'histogram', 'kpi', 'linechart', 'piechart', 'pivot-table', 'scatterplot', 'table', 'treemap', 'extension']),
    cols: PropTypes.array,
    options: PropTypes.object,
    noSelections: PropTypes.bool,
    width: PropTypes.string,
    height: PropTypes.string,
    minWidth: PropTypes.string,
    minHeight: PropTypes.string,
    exportData: PropTypes.bool,
    exportDataTitle: PropTypes.string,
    exportDataOptions: PropTypes.obj,
    exportImg: PropTypes.bool,
    exportImgTitle: PropTypes.string,
    exportImgOptions: PropTypes.obj,
    exportPdf: PropTypes.bool,
    exportPdfTitle: PropTypes.string,
    exportPdfOptions: PropTypes.obj,
    getQViz: PropTypes.func,
  }

  static defaultProps = {
    id: null,
    type: null,
    cols: [],
    options: {},
    noSelections: false,
    width: '100%',
    height: '100%',
    minWidth: 'auto',
    minHeight: 'auto',
    exportData: false,
    exportDataTitle: 'Export Data',
    exportDataOptions: { format: 'CSV_T', state: 'P' },
    exportImg: false,
    exportImgTitle: 'Export Image',
    exportImgOptions: { width: 300, height: 400, format: 'JPG' },
    exportPdf: false,
    exportPdfTitle: 'Export Pdf',
    exportPdfOptions: { documentSize: 'A4', orientation: 'landscape', aspectRatio: 2 },
    getQViz: () => {},
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: null,
    };
  }

  componentWillMount() {
    console.log('componentWillMount');
    this.qVizPromise = this.create();
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.show();
    this.props.getQViz(this.qVizPromise);
  }

  componentWillReceiveProps(newProps) {
    // console.log('qdt-component componentDidUpdate');
    // console.log(newProps.options);
    // console.log(this.props.options);
    // console.log(JSON.stringify(newProps.options) !== JSON.stringify(this.props.options));
    // console.log('shouldComponentUpdate');
    // if (JSON.stringify(newProps.options) !== JSON.stringify(this.props.options)) {
    //   console.log('qdt-component setting options');
    //   this.setOptions(newProps.options);
    //   return true;
    // }

    // return false;
    console.log('componentWillReceiveProps');
    this.setOptions(newProps.options);
    // this.close();
  }

  componentWillUnmount() {
    this.close();
  }

  async setOptions(options) {
    try {
      const qViz = await this.qVizPromise;
      qViz.setOptions(options);
    } catch (error) {
      this.setState({ error });
    }
  }

  async create() {
    try {
      const {
        qAppPromise, id, type, cols, options,
      } = this.props;
      const qApp = await qAppPromise;
      const qVizPromise = id ? qApp.visualization.get(id) : qApp.visualization.create(type, cols, options); // eslint-disable-line max-len
      return qVizPromise;
    } catch (error) {
      this.setState({ error });
      return undefined;
    }
  }

  async show() {
    try {
      const qViz = await this.qVizPromise;
      if (qViz) {
        await this.setState({ loading: false });
        qViz.show(this.node, { noSelections: this.props.noSelections });
      } else {
        throw new Error('Please specify a qConfig global variable');
      }
    } catch (error) {
      this.setState({ error });
    }
  }

  async close() {
    try {
      const qViz = await this.qVizPromise;
      qViz.close();
    } catch (error) {
      this.setState({ error });
    }
  }

  async resize() {
    const qViz = await this.qVizPromise;
    qViz.resize();
  }

  render() {
    console.log('render');
    const {
      width, height, minWidth, minHeight, exportData, exportDataTitle, exportDataOptions, exportImg, exportImgTitle, exportImgOptions, exportPdf, exportPdfTitle, exportPdfOptions,
    } = this.props;
    if (this.state.error) {
      return <div>{this.state.error.message}</div>;
    } else if (this.state.loading) {
      return (
        <div style={{
display: 'flex', alignItems: 'center', 'text-align': 'center', justifyContent: 'center', height: this.props.height,
}}
        >
          <FontAwesome style={{ margin: 'auto', marginTop: '40px' }} name="spinner" size="5x" spin />
        </div>

        // const paddingTop = (parseInt(height, 0)) ? (height / 2) - 10 : 0;
        // return <Preloader width={width} height={height} paddingTop={paddingTop} />;
      );
    }

    const btnStyle = { display: 'inline-block', paddingRight: 20, paddingTop: 15 };
    return (
      <div>
        <div
          ref={(node) => { this.node = node; }}
          style={{
 width, height, minWidth, minHeight,
}}
        />
        {exportData &&
          <div style={btnStyle}>
            <QdtButton type="exportData" qVizPromise={this.qVizPromise} title={exportDataTitle} options={exportDataOptions} />
          </div>}
        {exportImg &&
          <div style={btnStyle}>
            <QdtButton type="exportImg" qVizPromise={this.qVizPromise} title={exportImgTitle} options={exportImgOptions} />
          </div>}
        {exportPdf &&
          <div style={btnStyle}>
            <QdtButton type="exportPdf" qVizPromise={this.qVizPromise} title={exportPdfTitle} options={exportPdfOptions} />
          </div>}
      </div>
    );
  }
}
