import _ from 'lodash'

// change all "duration" keys into their numerical values, then pretty print to string
export const formatMessageDetails = (details?: object): string | undefined => {
  const compactedDetails: object = _.omitBy(details, _.isEmpty)

  if (_.isEmpty(compactedDetails)) return undefined

  const formattedDetails = _.cloneDeepWith(compactedDetails, (value, key) => {
    if (_.isNumber(key) || _.isNil(key)) return value

    if (key.includes('duration') && _.isNumber(value)) {
      const milliseconds = Math.round(value / 10000) / 100

      if (_.isNil(milliseconds)) return 'N/A'

      return milliseconds + ' ms'
    }

    return value
  })

  // pretty print json (takes more space in db, but less repeated calculations to do)
  return JSON.stringify(formattedDetails, null, 2)
}
