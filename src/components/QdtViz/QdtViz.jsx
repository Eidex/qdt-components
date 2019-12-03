import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
// import Preloader from '../../utilities/Preloader';
import QdtButton from '../QdtButton/QdtButton';


const QdtViz = ({
  qAppPromise, id, type, cols, options, noSelections, noInteraction, width, height, minWidth, minHeight, exportData, exportDataTitle, exportDataOptions, exportImg, exportImgTitle, exportImgOptions, exportPdf, exportPdfTitle, exportPdfOptions, chartId, getQViz,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const qVizPromise = useRef(null);
  const node = useRef(null);

  // let qViz = null;

  const btnStyle = { display: 'inline-block', paddingRight: 20, paddingTop: 15 };
  // let qVizPromise = null;

  const create = async () => {
    const qApp = await qAppPromise;
    qVizPromise.current = id ? qApp.visualization.get(id) : qApp.visualization.create(type, cols, options); // eslint-disable-line max-len
    getQViz(qVizPromise.current, chartId);
    const qViz = await qVizPromise.current;
    // qViz.setOptions(options);
    await setLoading(false);
    qViz.show(node.current, { noSelections, noInteraction });
  };

  const close = async () => {
    const qViz = await qVizPromise.current;
    qViz.close();
  };

  const resize = async () => {
    const qViz = await qVizPromise.current;
    qViz.resize();
  };

  useEffect(() => {
    try {
      (async () => {
        await create();
        window.addEventListener('resize', resize);
      })();
    } catch (_error) {
      setError(_error);
    }
    return () => {
      close();
      window.removeEventListener('resize', resize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (qVizPromise.current) {
        qVizPromise.current.then((qViz) => qViz.setOptions(options));
      }
    } catch (_error) {
      setError(_error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, qVizPromise.current]);

  return (
    <>
      { error && <div>{error.message}</div> }
      { loading
        // <Preloader width={width} height={height} paddingTop={(parseInt(height, 0)) ? (height / 2) - 10 : 0} />
        && (
        <div style={{
          display: 'flex', alignItems: 'center', 'text-align': 'center', justifyContent: 'center', height,
        }}
        >
          <FontAwesome style={{ margin: 'auto', marginTop: '40px' }} name="spinner" size="5x" spin />
        </div>
        )}
      { !error && !loading
        && (
          <>
            <div
              ref={node}
              style={{
                width, height, minWidth, minHeight,
              }}
            />
            {exportData && (
            <div style={btnStyle}>
              <QdtButton type="exportData" qVizPromise={qVizPromise} title={exportDataTitle} options={exportDataOptions} />
            </div>
            )}
            {exportImg && (
            <div style={btnStyle}>
              <QdtButton type="exportImg" qVizPromise={qVizPromise} title={exportImgTitle} options={exportImgOptions} />
            </div>
            )}
            {exportPdf
          && (
            <div style={btnStyle}>
              <QdtButton type="exportPdf" qVizPromise={qVizPromise} title={exportPdfTitle} options={exportPdfOptions} />
            </div>
          )}
          </>
        )}
    </>
  );
};

QdtViz.propTypes = {
  qAppPromise: PropTypes.object.isRequired,
  id: PropTypes.string,
  type: PropTypes.oneOf([null, 'barchart', 'boxplot', 'combochart', 'distributionplot', 'gauge', 'histogram', 'kpi', 'linechart', 'piechart', 'pivot-table', 'scatterplot', 'table', 'treemap', 'extension']),
  cols: PropTypes.array,
  options: PropTypes.object,
  noSelections: PropTypes.bool,
  noInteraction: PropTypes.bool,
  width: PropTypes.string,
  height: PropTypes.string,
  minWidth: PropTypes.string,
  minHeight: PropTypes.string,
  exportData: PropTypes.bool,
  exportDataTitle: PropTypes.string,
  exportDataOptions: PropTypes.object,
  exportImg: PropTypes.bool,
  exportImgTitle: PropTypes.string,
  exportImgOptions: PropTypes.object,
  exportPdf: PropTypes.bool,
  exportPdfTitle: PropTypes.string,
  exportPdfOptions: PropTypes.object,
  chartId: PropTypes.string,
  getQViz: PropTypes.func,
};

QdtViz.defaultProps = {
  id: null,
  type: null,
  cols: [],
  options: {},
  noSelections: false,
  noInteraction: false,
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
  chartId: null,
  getQViz: () => {},
};

export default QdtViz;
