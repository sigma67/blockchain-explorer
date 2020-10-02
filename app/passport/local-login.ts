// @ts-check

/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { User } from '../platform/fabric/models/User';

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const PassportLocalStrategy = require('passport-local').Strategy;

// @ts-ignore
const config = require('../explorerconfig.json');
// @ts-check
const jwtSignAsync = promisify(jwt.sign);

export const localLoginStrategy = function(platform) {
	const proxy = platform.getProxy();
	return new PassportLocalStrategy(
		{
			usernameField: 'user',
			passwordField: 'password',
			session: false,
			passReqToCallback: true
		},
		async (req, user, password, done) => {
			const userData = {
				user: user.trim(),
				password: password.trim()
			};

			const reqUser = await new User(req.body).asJson();
			const authResult = await proxy.authenticate(reqUser);
			if (!authResult) {
				return done(null, false, { message: 'Incorrect credentials' });
			}

			const payload = {
				user: reqUser.user,
				network: reqUser.network
			};

			// @ts-ignore
			const token = await jwtSignAsync(payload, config.jwt.secret, {
				expiresIn: config.jwt.expiresIn
			});
			// @ts-check
			const data = {
				message: 'logged in',
				name: userData.user
			};
			return done(null, token, data);
		}
	);
};
