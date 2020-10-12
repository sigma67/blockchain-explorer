/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const util = require('util');
const request = require('request');
const requtil = require('./requestutils');

/* TODO load Prometheus host:port from config*/
const PROMETHEUS_API_URL = 'http://localhost:9090/api/v1/';

/**
 *
 *
 * @param {*} router
 * @param {*} platform
 */
const metricroutes = async function(router, platform) {
	/**
	 * Prometheus Metrics
	 * GET /metrics
	 * curl -i 'http://<host>:<port>/metrics/<prometheus_query>'
	 * Response:
	 * JSON as specified in Prometheus docs
	 */
	router.get('/metrics/:prometheus_query', (req, res) => {
		const prometheus_query = req.params.prometheus_query;

		request.get(
			{
				url: PROMETHEUS_API_URL + prometheus_query,
				qs: req.query
			},
			(err, response, body) => {
				if (err) {
					return requtil.invalidRequest(req, res);
				}
				try {
					res.json(JSON.parse(body));
				} catch (e) {
					res.json({});
				}
			}
		);
	});

	router.get('/charts/txprocessing', (req, res) => {
		Promise.all(
			[
				'sum(rate(endorser_proposal_duration_sum[5m]))/sum(rate(endorser_proposal_duration_count[5m]))',
				'rate(broadcast_enqueue_duration_sum[5m])/rate(broadcast_enqueue_duration_count[5m])',
				'rate(broadcast_validate_duration_sum[5m])/rate(broadcast_validate_duration_count[5m])'
			].map(q => {
				req.query.query = q;
				const get = util.promisify(request.get);
				return get({
					url: PROMETHEUS_API_URL + 'query_range',
					qs: req.query
				});
			})
		)
        .then(metrics => {
            try {
                metrics = metrics.map(m => JSON.parse(m.body).data.result[0].values);
                const processed = new Array(metrics[0].length);
                for (let i = 0; i < metrics[0].length; i++) {
                    processed[i] = {
                        time: metrics[0][i][0],
                        endorser_proposal: metrics[0][i][1],
                        broadcast_enqueue: metrics[1][i][1],
                        broadcast_validate: metrics[2][i][1]
                    };
                }
                res.json(processed);
            } catch (e) {
                res.json({ e });
            }
        })
        .catch(err => {
            return requtil.invalidRequest(req, res);
        });
	});
};

module.exports = metricroutes;
