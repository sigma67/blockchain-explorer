import React, { Component } from 'react';

import compose from 'recompose/compose';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import Paper from '@material-ui/core/Paper';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import PersonIcon from '@material-ui/icons/Person';
import RemoveIcon from '@material-ui/icons/Remove';
import Avatar from '@material-ui/core/Avatar';
import { shape, string } from 'prop-types';
//import userListSelector,{chartOperations} from '../../state/redux/charts';
import { authSelectors, authOperations } from '../../state/redux/auth';
import { userListType, getUserListType } from '../types';
const styles = theme => {
	const { type } = theme.palette;
	const dark = type === 'dark';
	return {
		container: {
			width: 'auto',
			display: 'block', // Fix IE 11 issue.
			marginLeft: theme.spacing.unit * 3,
			marginRight: theme.spacing.unit * 3,
			[theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
				width: 400,
				marginLeft: 'auto',
				marginRight: 'auto'
			}
		},
		paper: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
				.spacing.unit * 3}px`
		},
		form: {
			width: '100%', // Fix IE 11 issue.
			marginTop: theme.spacing.unit
		},
		root: {
			width: '100%',
			maxWidth: 360,
			backgroundColor: theme.palette.background.paper
		},
		title: {
			marginTop: theme.spacing.unit * 2
		},
		actions: {
			marginTop: theme.spacing.unit * 3
		},
		errortext: {
			fontSize: 16,
			font: 'bold',
			color: 'red'
		},
		successtext: {
			fontSize: 16,
			font: 'bold',
			color: 'green'
		},
		closeButton: {
			position: 'absolute',
			right: theme.spacing.unit,
			top: theme.spacing.unit,
			color: theme.palette.grey[500]
		},
		adminIcon: {
			color: dark ? '#1f1a33' : '#004d6b',
			backgroundColor: dark ? '#6a9cf8' : '#b9d6e1'
		},
		userIcon: {
			color: dark ? '#79536d' : '#407b20',
			backgroundColor: dark ? '#f7cdea' : '#d0ecda'
		},
		deleteButton: {
			color: '#e33e19'
		}
	};
};
const { userlist, unregister } = authOperations;

const { userlistSelector, unregisteredSelector } = authSelectors;

export class Users extends Component {
	static propTypes = {
		classes: shape({
			form: string,
			container: string,
			paper: string,
			actions: string
		}).isRequired
	};

	constructor(props) {
		super(props);
		const { registered, userlists } = props;
		this.state = {
			rolesList: ['admin', 'user'],
			error: '',
			registered,
			isLoading: false,
			allValid: false,
			prompt: false,
			selectedUser: '',
			userlists: userlists,
			info: {
				status: '',
				message: ''
			}
		};
	}

	componentWillReceiveProps(nextProps) {
		const { registered = [], error, userlists } = nextProps;
		this.setState(() => ({
			registered,
			error,
			userlists
		}));
	}

	handleChange = event => {
		const { target } = event;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const { name } = target;
		this.setState({
			[name]: { value }
		});
	};
	deletePrompt = username => {
		this.setState({ prompt: true });
		this.setState({ selectedUser: username });
	};
	async reloadUsers() {
		const { userlists } = this.props;
		var index = userlists.findIndex(x => x.username === this.state.selectedUser);
		var newUsers = userlists;
		newUsers.splice(index, 1);
		this.setState({ userlists: newUsers });
	}
	async removeUser() {
		const { unregister } = this.props;
		await Promise.all([unregister({ user: this.state.selectedUser })]).then(
			message => {
				if (message[0].status === 'success') {
					this.reloadUsers();
				} else {
					this.setState({ info: message[0] });
				}
			}
		);
	}
	render() {
		const { classes, onClose } = this.props;
		/* const [open, setOpen] = React.useState(false);
		 */
		const { info } = this.state;
		const handleClose = () => {
			this.setState({
				prompt: false,
				info: {
					status: '',
					message: ''
				}
			});
		};
		const handleDelete = () => {
			this.setState({ info: { status: '', message: '' } });
			this.removeUser();
			this.setState({ selectedUser: '' });

			handleClose();
		};
		return (
			<div className={classes.container}>
				<Paper className={classes.paper}>
					{/* <Typography className={classes.title} component="h5" variant="headline">
						User List
					</Typography> */}
					<MuiDialogTitle>
						{onClose ? (
							<IconButton
								aria-label="Close"
								className={classes.closeButton}
								onClick={onClose}
							>
								<CloseIcon />
							</IconButton>
						) : null}
					</MuiDialogTitle>
					<List className={classes.root}>
						{this.state.userlists.map(user => (
							<ListItem key={user.username}>
								{user.roles === 'admin' ? (
									<ListItemAvatar className={classes.adminIcon}>
										<Avatar>
											<SupervisorAccountIcon />
										</Avatar>
									</ListItemAvatar>
								) : (
									<ListItemAvatar className={classes.userIcon}>
										<Avatar>
											<PersonIcon />
										</Avatar>
									</ListItemAvatar>
								)}
								{user.firstName ? (
									<ListItemText
										primary={user.firstName + ' ' + user.lastName}
										secondary={user.username}
									/>
								) : (
									<ListItemText primary="No Name Listed" secondary={user.username} />
								)}
								<IconButton
									className={classes.deleteButton}
									color="primary"
									aria-label="upload picture"
									component="span"
								>
									<RemoveIcon onClick={() => this.deletePrompt(user.username)} />
								</IconButton>
							</ListItem>
						))}
					</List>
					{info.status !== 'success' && (
						<FormHelperText id="component-error-text" error>
							{info.message}
						</FormHelperText>
					)}
					<Dialog
						open={this.state.prompt}
						keepMounted
						onClose={handleClose}
						aria-labelledby="alert-dialog-slide-title"
						aria-describedby="alert-dialog-slide-description"
					>
						<DialogTitle id="alert-dialog-slide-title">
							{'Delete a user?'}
						</DialogTitle>
						<DialogContent>
							<DialogContentText id="alert-dialog-slide-description">
								Are you sure you want to remove this user?
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button onClick={handleClose} color="primary">
								Cancel
							</Button>
							<Button onClick={handleDelete} color="primary">
								Delete
							</Button>
						</DialogActions>
					</Dialog>
				</Paper>
			</div>
		);
	}
}

const { errorSelector } = authSelectors;
Users.propTypes = {
	userlists: userListType.isRequired,
	userlist: getUserListType.isRequired
};
export default compose(
	withStyles(styles),
	connect(
		state => ({
			error: errorSelector(state),
			userlists: userlistSelector(state),
			unregistered: unregisteredSelector(state)
		}),
		{
			userlist: userlist,
			unregister: unregister
		}
	)
)(Users);
